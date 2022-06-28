import type { NextPage } from "next";
import type { FC, ReactNode } from "react";

import { useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

const Draggable: FC<{ children: ReactNode }> = ({ children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "draggable",
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </button>
  );
};

const Droppable: FC<{ children: ReactNode }> = ({ children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: "droppable",
  });
  return (
    <div ref={setNodeRef} style={{ color: isOver ? "green" : undefined }}>
      {children}
    </div>
  );
};

const Home: NextPage = () => {
  const [isDropped, setIsDropped] = useState(false);
  const draggableMarkup = <Draggable>Drag me</Draggable>;

  return (
    <DndContext
      onDragEnd={(event) => {
        if (event.over && event.over.id === "droppable") {
          setIsDropped(true);
        }
      }}
    >
      {!isDropped ? draggableMarkup : null}
      <Droppable>{isDropped ? draggableMarkup : "Drop here"}</Droppable>
    </DndContext>
  );
};

export default Home;
