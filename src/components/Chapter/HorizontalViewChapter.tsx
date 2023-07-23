import type { Chapter, Manga } from '@prisma/client';
import Image from 'next/image';
import { forwardRef } from 'react';

interface HorizontalViewChapterProps {
  chapter: Pick<Chapter, 'images'> & {
    manga: Pick<Manga, 'name'>;
  };
  slideLeft(): void;
  slideRight(): void;
  imageRef: (node: Element | null | undefined) => void;
  currentImage: number;
}

const HorizontalViewChapter = forwardRef<
  HTMLDivElement,
  HorizontalViewChapterProps
>(({ chapter, slideLeft, slideRight, imageRef, currentImage }, ref) => {
  return (
    <div
      ref={ref}
      className="no-scrollbar flex h-full w-full overflow-auto scroll-smooth transition-transform"
    >
      {chapter.images.map((img, idx) => {
        if (idx === Math.floor(chapter.images.length * 0.7)) {
          return (
            <div
              id={`${idx}`}
              key={idx}
              className="relative h-full w-full shrink-0"
            >
              <Image
                ref={imageRef}
                fill
                priority
                src={img}
                alt={chapter.manga.name}
                tabIndex={-1}
                className="object-contain"
              />
            </div>
          );
        } else {
          return (
            <div
              id={`${idx}`}
              key={idx}
              className="relative h-full w-full shrink-0"
            >
              <Image
                fill
                priority
                src={img}
                alt={chapter.manga.name}
                tabIndex={-1}
                className="object-contain"
              />
            </div>
          );
        }
      })}

      <button
        onClick={slideLeft}
        disabled={currentImage <= 0}
        className="absolute left-0 h-full w-2/5 opacity-0"
      />

      <button
        onClick={slideRight}
        disabled={currentImage + 1 >= chapter.images.length}
        className="absolute right-0 h-full w-2/5 opacity-0"
      />
    </div>
  );
});

HorizontalViewChapter.displayName = 'HorizontalViewChapter';

export default HorizontalViewChapter;
