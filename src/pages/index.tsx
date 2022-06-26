import type { NextPage } from "next";
import { FC, useEffect } from "react";
import type { Identifier } from "dnd-core";

import { useState, useRef } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = {
  CARD: "card",
} as const;

const Card: FC<{
  id: number;
  text: string;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}> = ({ id, text, index, moveCard }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop<
    {
      index: number;
    },
    void,
    { handlerId: Identifier | null }
  >({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) {
        return;
      }
      const { top, bottom } = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (bottom - top) / 2;
      const hoverClientY = clientOffset.y - top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0 : 1;

  useEffect(() => {
    drag(drop(ref));
  });

  return (
    <div ref={ref} style={{ opacity }} data-handler-id={handlerId}>
      {text}
    </div>
  );
};

const Home: NextPage = () => {
  const [cards, setCards] = useState<
    {
      id: number;
      text: string;
    }[]
  >([
    {
      id: 1,
      text: "Write a cool JS library",
    },
    {
      id: 2,
      text: "Make it generic enough",
    },
    {
      id: 3,
      text: "Write README",
    },
    {
      id: 4,
      text: "Create some examples",
    },
    {
      id: 5,
      text: "Spam in Twitter and IRC to promote it (note that this element is taller than the others)",
    },
  ]);

  const moveCard = (dragIndex: number, hoverIndex: number) => {
    type Item = {
      id: number;
      text: string;
    };
    const splice = (
      input: Item[],
      start: number,
      deleteCount: number,
      ...items: Item[]
    ) =>
      input.slice(0, start).concat(...items, input.slice(start + deleteCount));
    setCards((prevCards) =>
      splice(
        splice(prevCards, dragIndex, 1),
        hoverIndex,
        0,
        prevCards[dragIndex]
      )
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {cards.map(({ id, text }, index) => {
        return (
          <Card
            key={id}
            id={id}
            text={text}
            index={index}
            moveCard={moveCard}
          />
        );
      })}
    </DndProvider>
  );
};

export default Home;
