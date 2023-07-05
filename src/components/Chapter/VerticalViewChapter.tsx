import type { Chapter, Manga } from '@prisma/client';
import Image from 'next/image';
import { forwardRef, type MutableRefObject, memo } from 'react';

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
      className="h-full w-full space-y-2 md:space-y-10 overflow-auto no-scrollbar"
    >
      {chapter.images.map((img, idx) => {
        if (idx === 0) {
          return (
            <div key={`${idx}`} id={`${idx}`} className="relative h-fit w-full">
              <Image
                ref={currentImageRef}
                width={0}
                height={0}
                sizes="0%"
                priority
                src={img}
                alt={`Trang ${idx + 1}`}
                className="object-contain max-sm:w-full w-4/5 md:mx-auto"
              />
            </div>
          );
        } else if (idx === Math.floor(chapter.images.length * 0.7)) {
          return (
            <div key={`${idx}`} id={`${idx}`} className="relative h-fit w-full">
              <Image
                ref={imageRef}
                width={0}
                height={0}
                sizes="0%"
                src={img}
                alt={`Trang ${idx + 1}`}
                className="object-contain max-sm:w-full w-4/5 md:mx-auto"
              />
            </div>
          );
        } else {
          return (
            <div key={`${idx}`} id={`${idx}`} className="relative h-fit w-full">
              <Image
                width={0}
                height={0}
                sizes="0%"
                src={img}
                alt={`Trang ${idx + 1}`}
                className="object-contain max-sm:w-full w-4/5 md:mx-auto"
              />
            </div>
          );
        }
      })}
    </div>
  );
});

VerticalViewChapter.displayName = 'VerticalViewChapter';

export default memo(VerticalViewChapter);
