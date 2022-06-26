import type { NextPage } from "next";
import type { FC } from "react";
import type { Identifier } from "dnd-core";

import { useState, useRef, useEffect } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ITEM = "item" as const;
const Item: FC<{
  id: number;
  text: string;
  index: number;
  move: (dragIndex: number, index: number) => void;
}> = ({ id, text, index, move }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop<
    {
      index: number;
    },
    void,
    { handlerId: Identifier | null }
  >({
    accept: ITEM,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }

      const { index: dragIndex } = item;
      if (dragIndex === index) {
        return;
      }

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) {
        return;
      }

      const { top, bottom } = ref.current.getBoundingClientRect();
      const hoverMiddleY = (bottom - top) / 2;
      const hoverClientY = clientOffset.y - top;
      if (dragIndex < index && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > index && hoverClientY > hoverMiddleY) {
        return;
      }

      move(dragIndex, index);
      item.index = index;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: ITEM,
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
  const [items, setItems] = useState<
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

  const move = (dragIndex: number, index: number) => {
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
    setItems((items) =>
      splice(splice(items, dragIndex, 1), index, 0, items[dragIndex])
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {items.map(({ id, text }, index) => {
        return <Item key={id} id={id} text={text} index={index} move={move} />;
      })}
    </DndProvider>
  );
};

export default Home;
