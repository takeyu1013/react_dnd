import type { NextPage } from "next";

import { useState, useRef, useEffect, FC } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ITEM = "item" as const;

type Item = {
  id: number;
  text: string;
};

const Item: FC<
  Item & {
    index: number;
    move: (dragIndex: number, index: number) => void;
  }
> = ({ id, text, index, move }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [, drag] = useDrag<Pick<Item, "id"> & { index: number }>({
    type: ITEM,
    item: { id, index },
  });
  const [, drop] = useDrop<{ index: number }>({
    accept: ITEM,
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

  useEffect(() => {
    drag(drop(ref));
  });

  return <div ref={ref}>{text}</div>;
};

const Home: NextPage = () => {
  const [items, setItems] = useState<Item[]>([
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

  return (
    <DndProvider backend={HTML5Backend}>
      {items.map(({ id, text }, index) => {
        return (
          <Item
            key={id}
            id={id}
            text={text}
            index={index}
            move={(dragIndex, index) => {
              const splice = (
                input: Item[],
                start: number,
                deleteCount: number,
                ...items: Item[]
              ) =>
                input
                  .slice(0, start)
                  .concat(...items, input.slice(start + deleteCount));
              setItems((items) =>
                splice(splice(items, dragIndex, 1), index, 0, items[dragIndex])
              );
            }}
          />
        );
      })}
    </DndProvider>
  );
};

export default Home;
