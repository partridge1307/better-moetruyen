import type { Chapter, Manga } from '@prisma/client';
import Image from 'next/image';
import { forwardRef, type MutableRefObject } from 'react';

interface VerticalViewChapterProps {
  chapter: Chapter & {
    manga: Pick<Manga, 'name'>;
  };
  imageRef: MutableRefObject<HTMLImageElement | null>;
  currentImageRef: MutableRefObject<HTMLImageElement | null>;
}

const VerticalViewChapter = forwardRef<
  HTMLDivElement,
  VerticalViewChapterProps
>(({ chapter, imageRef, currentImageRef }, ref) => {
  return (
    <div
      ref={ref}
      className="h-full w-full md:space-y-10 overflow-auto no-scrollbar"
    >
      {chapter.images.map((img, idx) => {
        if (idx === 0) {
          return (
            <div
              key={`${idx}`}
              id={`${idx}`}
              className="relative h-full md:h-[200%] w-full"
            >
              <Image
                ref={currentImageRef}
                fill
                priority
                src={img}
                alt={chapter.manga.name}
                className="object-contain"
              />
            </div>
          );
        } else if (idx === Math.floor((chapter.images.length * 70) / 100)) {
          return (
            <div
              key={`${idx}`}
              id={`${idx}`}
              className="relative h-full md:h-[200%] w-full"
            >
              <Image
                ref={imageRef}
                fill
                priority
                src={img}
                alt={chapter.manga.name}
                className="object-contain"
              />
            </div>
          );
        } else {
          return (
            <div
              key={idx}
              id={`${idx}`}
              className="relative h-full md:h-[200%] w-full"
            >
              <Image
                fill
                priority
                src={img}
                alt={chapter.manga.name}
                className="object-contain"
              />
            </div>
          );
        }
      })}
    </div>
  );
});

VerticalViewChapter.displayName = 'VerticalViewChapter';

export default VerticalViewChapter;
