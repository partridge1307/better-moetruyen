import type { Chapter, Manga } from '@prisma/client';
import Image from 'next/image';
import { forwardRef, type MutableRefObject } from 'react';
import { useMediaQuery } from 'react-responsive';

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
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  return (
    <div
      ref={ref}
      className="h-full w-full space-y-2 md:space-y-10 overflow-auto no-scrollbar"
    >
      {chapter.images.map((img, idx) => {
        if (!isMobile) {
          if (idx === 0) {
            return (
              <div
                key={`${idx}`}
                id={`${idx}`}
                className="relative h-[200%] w-full"
              >
                <Image
                  ref={currentImageRef}
                  fill
                  priority
                  src={img}
                  alt={`Trang ${idx + 1}`}
                  className="object-contain"
                />
              </div>
            );
          } else if (idx === Math.floor(chapter.images.length * 0.7)) {
            return (
              <div
                key={`${idx}`}
                id={`${idx}`}
                className="relative h-[200%] w-full"
              >
                <Image
                  ref={imageRef}
                  fill
                  priority
                  src={img}
                  alt={`Trang ${idx + 1}`}
                  className="object-contain"
                />
              </div>
            );
          } else {
            return (
              <div
                key={`${idx}`}
                id={`${idx}`}
                className="relative h-[200%] w-full"
              >
                <Image
                  fill
                  priority
                  src={img}
                  alt={`Trang ${idx + 1}`}
                  className="object-contain"
                />
              </div>
            );
          }
        } else {
          if (idx === 0) {
            return (
              <div
                key={`${idx}`}
                id={`${idx}`}
                className="relative h-fit w-full"
              >
                <Image
                  ref={currentImageRef}
                  width={0}
                  height={0}
                  sizes="100%"
                  priority
                  src={img}
                  alt={`Trang ${idx + 1}`}
                  className="object-contain w-full"
                />
              </div>
            );
          } else if (idx === Math.floor(chapter.images.length * 0.7)) {
            return (
              <div
                key={`${idx}`}
                id={`${idx}`}
                className="relative h-fit w-full"
              >
                <Image
                  ref={imageRef}
                  width={0}
                  height={0}
                  sizes="100%"
                  priority
                  src={img}
                  alt={`Trang ${idx + 1}`}
                  className="object-contain w-full"
                />
              </div>
            );
          } else {
            return (
              <div
                key={`${idx}`}
                id={`${idx}`}
                className="relative h-fit w-full"
              >
                <Image
                  width={0}
                  height={0}
                  sizes="100%"
                  priority
                  src={img}
                  alt={`Trang ${idx + 1}`}
                  className="object-contain"
                />
              </div>
            );
          }
        }
      })}
    </div>
  );
});

VerticalViewChapter.displayName = 'VerticalViewChapter';

export default VerticalViewChapter;
