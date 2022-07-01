import type { NextPage } from "next";
import type { FC, ReactNode } from "react";

import { useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Draggable: FC<{ children: ReactNode }> = ({ children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "draggable",
  });

  return (
    <button
      ref={setNodeRef}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      {...listeners}
      {...attributes}
    >
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

const Sortable: FC<{ id: number }> = ({ id }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      {id}
    </div>
  );
};

const Home: NextPage = () => {
  const [isDropped, setIsDropped] = useState(false);
  const draggableMarkup = <Draggable>Drag me</Draggable>;
  const [items, setItems] = useState([1, 2, 3]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <main>
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (!over) {
            return;
          }
          const { id: activeId } = active;
          const { id: overId } = over;
          if (
            typeof activeId !== "number" ||
            typeof overId !== "number" ||
            activeId === overId
          ) {
            return;
          }
          setItems((items) =>
            arrayMove(items, items.indexOf(activeId), items.indexOf(overId))
          );
        }}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((id) => (
            <Sortable key={id} id={id} />
          ))}
        </SortableContext>
      </DndContext>
    </main>
  );
};

export default Home;
