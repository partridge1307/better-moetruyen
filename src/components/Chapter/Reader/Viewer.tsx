import { buttonVariants } from '@/components/ui/Button';
import type { DirectionType } from '@/hooks/use-direction-reader';
import type { LayoutType } from '@/hooks/use-layout-reader';
import { cn } from '@/lib/utils';
import classes from '@/styles/chapter/viewer.module.css';
import type { Chapter } from '@prisma/client';
import type { UseEmblaCarouselType } from 'embla-carousel-react';
import Link from 'next/link';
import { memo, type FC } from 'react';

interface ViewerProps {
  emblaRef: UseEmblaCarouselType[0];
  title: string;
  mangaSlug: string;
  images: string[];
  commentToggle: boolean;
  menuToggle: boolean;
  layout: LayoutType;
  direction: DirectionType;
  prevChapter: Pick<Chapter, 'id' | 'volume' | 'chapterIndex' | 'name'> | null;
  nextChapter: Pick<Chapter, 'id' | 'volume' | 'chapterIndex' | 'name'> | null;
}

const Viewer: FC<ViewerProps> = ({
  emblaRef,
  title,
  mangaSlug,
  images,
  commentToggle,
  menuToggle,
  layout,
  direction,
  prevChapter,
  nextChapter,
}) => {
  return (
    <div
      ref={emblaRef}
      className={cn(
        'w-full h-full transition-[width] duration-75',
        {
          'w-[calc(100%-24rem)]': commentToggle || menuToggle,
          'xl:w-[calc(100%-48rem)]': commentToggle && menuToggle,
        },
        classes.mt_wrapper
      )}
    >
      <div
        className={`${classes.mt_container} ${
          layout === 'VERTICAL' ? classes.mt_vertical : classes.mt_horizontal
        }`}
        dir={direction === 'rtl' && layout !== 'VERTICAL' ? 'rtl' : 'ltr'}
      >
        {/* Start section */}
        <div className="relative min-w-0 w-full h-full shrink-0 grow-0 basis-full flex justify-center items-center">
          <div className="relative max-w-sm flex flex-col justify-center items-center gap-2 p-2.5 rounded-lg border border-primary/30">
            <p className="text-2xl line-clamp-2 text-center">
              Bạn đang đọc {title}
            </p>
            <Link
              aria-label="start chapter link button"
              href={
                !!prevChapter
                  ? `/chapter/${prevChapter.id}`
                  : `/manga/${mangaSlug}`
              }
              className={buttonVariants({
                variant: 'secondary',
                className: 'w-full',
              })}
            >
              <span className="line-clamp-1">
                {!!prevChapter
                  ? `Chap truớc [Vol. ${prevChapter.volume} Ch. ${
                      prevChapter.chapterIndex
                    }${!!prevChapter.name && ` - ${prevChapter.name}`}]`
                  : 'Thông tin truyện'}
              </span>
            </Link>
          </div>
        </div>
        {layout === 'DOUBLE' && <div />}
        {/* Viewer */}
        {images.map((image, idx) => (
          <div
            key={idx}
            className={`${classes.mt_page} ${
              layout === 'DOUBLE'
                ? classes.mt_double
                : layout === 'SINGLE'
                ? classes.mt_single
                : classes.mt_page_vertical
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              fetchPriority="high"
              loading="lazy"
              src={image}
              alt={`Trang ${idx + 1}`}
              className={
                layout === 'VERTICAL'
                  ? '!static !w-auto !h-auto mx-auto'
                  : undefined
              }
              style={{
                ...(layout !== 'VERTICAL' && {
                  objectFit: 'scale-down',
                }),
                ...(layout === 'DOUBLE' &&
                  direction === 'ltr' && {
                    objectPosition: idx % 2 === 0 ? 'right' : 'left',
                  }),
                ...(layout === 'DOUBLE' &&
                  direction === 'rtl' && {
                    objectPosition: idx % 2 === 0 ? 'left' : 'right',
                  }),
                position: 'absolute',
                inset: 0,
                color: 'transparent',
              }}
            />
          </div>
        ))}
        {/* End section */}
        <div className="relative min-w-0 w-full h-full shrink-0 grow-0 basis-full flex justify-center items-center">
          <div className="relative max-w-sm flex flex-col justify-center items-center gap-2 p-2.5 rounded-lg border border-primary/30">
            <p className="text-2xl text-center">
              {!!nextChapter ? 'Tiếp theo' : 'Đã là chương mới nhất'}
            </p>
            <Link
              aria-label="end chapter link button"
              href={
                !!nextChapter
                  ? `/chapter/${nextChapter.id}`
                  : `/manga/${mangaSlug}`
              }
              className={buttonVariants({
                variant: 'secondary',
                className: 'w-full',
              })}
            >
              <span className="line-clamp-1">
                {!!nextChapter
                  ? `Chap tiếp [Vol. ${nextChapter.volume} Ch. ${
                      nextChapter.chapterIndex
                    }${!!nextChapter.name && ` - ${nextChapter.name}`}]`
                  : 'Thông tin truyện'}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Viewer);
