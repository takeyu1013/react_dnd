import type { NextPage } from "next";
import type { FC } from "react";
import type { Identifier, XYCoord } from "dnd-core";

import { useCallback, useState, useRef } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type DragItem = {
  index: number;
  id: string;
  type: string;
};

const ItemTypes = {
  CARD: "card",
};

const Card: FC<{
  id: number;
  text: string;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}> = ({ id, text, index, moveCard }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) {
        return;
      }

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
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
  drag(drop(ref));
  return (
    <div ref={ref} style={{ opacity }} data-handler-id={handlerId}>
      {text}
    </div>
  );
};

type Item = {
  id: number;
  text: string;
};

const Container: FC = () => {
  const [cards, setCards] = useState([
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
    {
      id: 6,
      text: "???",
    },
    {
      id: 7,
      text: "PROFIT",
    },
  ]);

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    const splice = (
      input: Item[],
      start: number,
      deleteCount: number,
      ...items: Item[]
    ) =>
      input.slice(0, start).concat(...items, input.slice(start + deleteCount));
    setCards((prevCards: Item[]) => {
      return splice(
        splice(prevCards, dragIndex, 1),
        hoverIndex,
        0,
        prevCards[dragIndex]
      );
    });
  }, []);

  return (
    <>
      <div>
        {cards.map((card, index) => {
          return (
            <Card
              key={card.id}
              index={index}
              id={card.id}
              text={card.text}
              moveCard={moveCard}
            />
          );
        })}
      </div>
    </>
  );
};

const Home: NextPage = () => {
  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        <Container />
      </DndProvider>
    </div>
  );
};

export default Home;
