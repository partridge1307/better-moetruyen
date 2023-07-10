import type { Chapter, Manga } from '@prisma/client';
import Image from 'next/image';
import { forwardRef, memo } from 'react';

interface VerticalViewChapterProps {
  chapter: Chapter & {
    manga: Pick<Manga, 'name'>;
  };
  imageRef: (node: Element | null | undefined) => void;
}

const VerticalViewChapter = forwardRef<
  HTMLDivElement,
  VerticalViewChapterProps
>(({ chapter, imageRef }, ref) => {
  return (
    <div
      ref={ref}
      className="no-scrollbar h-full w-full space-y-2 overflow-auto md:space-y-10"
    >
      {chapter.images.map((img, idx) => {
        if (idx === Math.floor(chapter.images.length * 0.7)) {
          return (
            <div key={`${idx}`} id={`${idx}`} className="relative h-fit w-full">
              <Image
                ref={imageRef}
                width={0}
                height={0}
                priority
                sizes="0%"
                src={img}
                alt={`Trang ${idx + 1}`}
                tabIndex={-1}
                className="w-4/5 object-contain max-sm:w-full md:mx-auto"
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
                priority
                src={img}
                alt={`Trang ${idx + 1}`}
                tabIndex={-1}
                className="w-4/5 object-contain max-sm:w-full md:mx-auto"
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
