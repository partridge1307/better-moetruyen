import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, X } from 'lucide-react';
import Image from 'next/image';
import type { Dispatch, FC, SetStateAction } from 'react';
import { useCallback, useMemo, useState } from 'react';

interface indexProps {
  items: { src: string; name: string }[];
  isUpload: boolean;
  setItems: Dispatch<SetStateAction<{ src: string; name: string }[]>>;
}

const DnDChapterImage: FC<indexProps> = ({ items, setItems, isUpload }) => {
  const sensors = useSensors(useSensor(TouchSensor), useSensor(MouseSensor));
  const itemIds = useMemo(() => items.map((item) => item.src), [items]);
  const [currentIdx, setCurrentIdx] = useState<number>(-1);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        setItems((items) => {
          const oldIndex = items.findIndex((item) => item.src === active.id);
          const newIndex = items.findIndex((item) => item.src === over?.id);

          return arrayMove(items, oldIndex, newIndex);
        });
      }
    },
    [setItems]
  );

  function onEditImage(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      const target = e.target.files[0];
      const src = URL.createObjectURL(target);
      items[currentIdx] = { src, name: target.name };
      setItems([...items]);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext disabled={isUpload} items={itemIds}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 py-4">
          {items.map((item, idx) => (
            <SortableItem
              isUpload={isUpload}
              key={idx}
              index={idx}
              setCurrentIdx={setCurrentIdx}
              setItems={setItems}
              img={item}
            />
          ))}
        </div>
      </SortableContext>
      <input
        id="edit-image"
        type="file"
        accept=".jpg, .png, .jpeg"
        className="hidden"
        onChange={onEditImage}
      />
    </DndContext>
  );
};

export default DnDChapterImage;

function SortableItem({
  img,
  index,
  isUpload,
  setCurrentIdx,
  setItems,
}: {
  img: { src: string; name: string };
  index: number;
  isUpload: boolean;
  setCurrentIdx: Dispatch<SetStateAction<number>>;
  setItems: Dispatch<SetStateAction<{ src: string; name: string }[]>>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: img.src });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="relative p-2 w-40 h-52">
        <Image
          width={0}
          height={0}
          sizes="0&"
          priority
          src={img.src}
          alt={img.name}
          className="object-cover w-36 h-48 rounded-md"
        />

        {!isUpload ? (
          <span
            onPointerDown={() => {
              const target = document.getElementById(
                'edit-image'
              ) as HTMLInputElement;
              target.click();
              setCurrentIdx(index);
            }}
            className="absolute top-0 left-0 rounded-full dark:bg-zinc-900/75"
          >
            <Pencil className="p-1" />
          </span>
        ) : null}

        {!isUpload ? (
          <span
            onPointerDown={() => {
              setItems((items) => [
                ...items.filter((item) => item.src !== items[index].src),
              ]);
            }}
            className="absolute top-0 right-0 rounded-full dark:bg-zinc-900/75"
          >
            <X className="p-1" />
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-2 mx-2 text-sm">
          <p className="p-1 px-2 text-center text-xs dark:bg-zinc-900/75 line-clamp-1 w-full rounded-full">
            {img.name}
          </p>
        </div>
      </div>
    </div>
  );
}
