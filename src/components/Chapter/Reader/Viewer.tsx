import { buttonVariants } from '@/components/ui/Button';
import type { DirectionType } from '@/hooks/use-direction-reader';
import type { LayoutType } from '@/hooks/use-layout-reader';
import { cn } from '@/lib/utils';
import classes from '@/styles/chapter/viewer.module.css';
import type { Chapter } from '@prisma/client';
import type { UseEmblaCarouselType } from 'embla-carousel-react';
import Image from 'next/image';
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

const blurDataUrl =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBzdHlsZT0ibWFyZ2luOiBhdXRvOyBiYWNrZ3JvdW5kOiBub25lOyBkaXNwbGF5OiBibG9jazsgc2hhcGUtcmVuZGVyaW5nOiBhdXRvOyBhbmltYXRpb24tcGxheS1zdGF0ZTogcnVubmluZzsgYW5pbWF0aW9uLWRlbGF5OiAwczsiIHdpZHRoPSIyMDBweCIgaGVpZ2h0PSIyMDBweCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIj4KPGcgdHJhbnNmb3JtPSJyb3RhdGUoMCA1MCA1MCkiIHN0eWxlPSJhbmltYXRpb24tcGxheS1zdGF0ZTogcnVubmluZzsgYW5pbWF0aW9uLWRlbGF5OiAwczsiPgogIDxyZWN0IHg9IjQ3LjUiIHk9IjIzIiByeD0iMi41IiByeT0iOCIgd2lkdGg9IjUiIGhlaWdodD0iMTYiIGZpbGw9IiM5M2RiZTkiIHN0eWxlPSJhbmltYXRpb24tcGxheS1zdGF0ZTogcnVubmluZzsgYW5pbWF0aW9uLWRlbGF5OiAwczsiPgogICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGJlZ2luPSItMC44NTcxNDI4NTcxNDI4NTcxcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIHN0eWxlPSJhbmltYXRpb24tcGxheS1zdGF0ZTogcnVubmluZzsgYW5pbWF0aW9uLWRlbGF5OiAwczsiPjwvYW5pbWF0ZT4KICA8L3JlY3Q+CjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSg1MS40Mjg1NzE0Mjg1NzE0MyA1MCA1MCkiIHN0eWxlPSJhbmltYXRpb24tcGxheS1zdGF0ZTogcnVubmluZzsgYW5pbWF0aW9uLWRlbGF5OiAwczsiPgogIDxyZWN0IHg9IjQ3LjUiIHk9IjIzIiByeD0iMi41IiByeT0iOCIgd2lkdGg9IjUiIGhlaWdodD0iMTYiIGZpbGw9IiM5M2RiZTkiIHN0eWxlPSJhbmltYXRpb24tcGxheS1zdGF0ZTogcnVubmluZzsgYW5pbWF0aW9uLWRlbGF5OiAwczsiPgogICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGJlZ2luPSItMC43MTQyODU3MTQyODU3MTQzcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIHN0eWxlPSJhbmltYXRpb24tcGxheS1zdGF0ZTogcnVubmluZzsgYW5pbWF0aW9uLWRlbGF5OiAwczsiPjwvYW5pbWF0ZT4KICA8L3JlY3Q+CjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgxMDIuODU3MTQyODU3MTQyODYgNTAgNTApIiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij4KICA8cmVjdCB4PSI0Ny41IiB5PSIyMyIgcng9IjIuNSIgcnk9IjgiIHdpZHRoPSI1IiBoZWlnaHQ9IjE2IiBmaWxsPSIjOTNkYmU5IiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij4KICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMTswIiBrZXlUaW1lcz0iMDsxIiBkdXI9IjFzIiBiZWdpbj0iLTAuNTcxNDI4NTcxNDI4NTcxNHMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij48L2FuaW1hdGU+CiAgPC9yZWN0Pgo8L2c+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMTU0LjI4NTcxNDI4NTcxNDI4IDUwIDUwKSIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+CiAgPHJlY3QgeD0iNDcuNSIgeT0iMjMiIHJ4PSIyLjUiIHJ5PSI4IiB3aWR0aD0iNSIgaGVpZ2h0PSIxNiIgZmlsbD0iIzkzZGJlOSIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+CiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjE7MCIga2V5VGltZXM9IjA7MSIgZHVyPSIxcyIgYmVnaW49Ii0wLjQyODU3MTQyODU3MTQyODU1cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIHN0eWxlPSJhbmltYXRpb24tcGxheS1zdGF0ZTogcnVubmluZzsgYW5pbWF0aW9uLWRlbGF5OiAwczsiPjwvYW5pbWF0ZT4KICA8L3JlY3Q+CjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgyMDUuNzE0Mjg1NzE0Mjg1NzIgNTAgNTApIiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij4KICA8cmVjdCB4PSI0Ny41IiB5PSIyMyIgcng9IjIuNSIgcnk9IjgiIHdpZHRoPSI1IiBoZWlnaHQ9IjE2IiBmaWxsPSIjOTNkYmU5IiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij4KICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMTswIiBrZXlUaW1lcz0iMDsxIiBkdXI9IjFzIiBiZWdpbj0iLTAuMjg1NzE0Mjg1NzE0Mjg1N3MiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij48L2FuaW1hdGU+CiAgPC9yZWN0Pgo8L2c+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMjU3LjE0Mjg1NzE0Mjg1NzE3IDUwIDUwKSIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+CiAgPHJlY3QgeD0iNDcuNSIgeT0iMjMiIHJ4PSIyLjUiIHJ5PSI4IiB3aWR0aD0iNSIgaGVpZ2h0PSIxNiIgZmlsbD0iIzkzZGJlOSIgc3R5bGU9ImFuaW1hdGlvbi1wbGF5LXN0YXRlOiBydW5uaW5nOyBhbmltYXRpb24tZGVsYXk6IDBzOyI+CiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjE7MCIga2V5VGltZXM9IjA7MSIgZHVyPSIxcyIgYmVnaW49Ii0wLjE0Mjg1NzE0Mjg1NzE0Mjg1cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIHN0eWxlPSJhbmltYXRpb24tcGxheS1zdGF0ZTogcnVubmluZzsgYW5pbWF0aW9uLWRlbGF5OiAwczsiPjwvYW5pbWF0ZT4KICA8L3JlY3Q+CjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgzMDguNTcxNDI4NTcxNDI4NTYgNTAgNTApIiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij4KICA8cmVjdCB4PSI0Ny41IiB5PSIyMyIgcng9IjIuNSIgcnk9IjgiIHdpZHRoPSI1IiBoZWlnaHQ9IjE2IiBmaWxsPSIjOTNkYmU5IiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij4KICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMTswIiBrZXlUaW1lcz0iMDsxIiBkdXI9IjFzIiBiZWdpbj0iMHMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBzdHlsZT0iYW5pbWF0aW9uLXBsYXktc3RhdGU6IHJ1bm5pbmc7IGFuaW1hdGlvbi1kZWxheTogMHM7Ij48L2FuaW1hdGU+CiAgPC9yZWN0Pgo8L2c+CjwhLS0gW2xkaW9dIGdlbmVyYXRlZCBieSBodHRwczovL2xvYWRpbmcuaW8vIC0tPjwvc3ZnPg==';

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
            <p className="text-2xl line-clamp-2">Bạn đang đọc {title}</p>
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
            <Image
              fill
              priority
              loading="lazy"
              sizes={layout === 'DOUBLE' ? '50vw' : '100vw'}
              src={image}
              placeholder="blur"
              blurDataURL={blurDataUrl}
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
