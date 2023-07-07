import { cn } from "@/lib/utils";
import type { Chapter, Manga } from "@prisma/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { forwardRef, type MutableRefObject } from "react";

interface HorizontalViewChapterProps {
  chapter: Chapter & {
    manga: Pick<Manga, "name">;
  };
  slideLeft(): void;
  slideRight(): void;
  imageRef: MutableRefObject<HTMLImageElement | null>;
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
        if (idx === Math.floor((chapter.images.length * 70) / 100)) {
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

      {currentImage + 1 >= chapter.images.length && (
        <Link href={`/chapter/`}></Link>
      )}

      <button
        onClick={slideLeft}
        className={cn(
          "absolute left-0 h-full w-2/5 opacity-0",
          currentImage <= 0 ? "hidden" : null
        )}
      >
        <ChevronLeft className="h-20 w-20" />
      </button>
      <button
        onClick={slideRight}
        className={cn(
          "absolute right-0 h-full w-2/5 opacity-0",
          currentImage + 1 >= chapter.images.length ? "hidden" : null
        )}
      >
        <ChevronRight className="h-20 w-20" />
      </button>
    </div>
  );
});

HorizontalViewChapter.displayName = "HorizontalViewChapter";

export default HorizontalViewChapter;
