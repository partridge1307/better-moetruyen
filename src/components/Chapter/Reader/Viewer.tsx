'use client';

import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import classes from '@/styles/chapter/viewer.module.css';
import type { UseEmblaCarouselType } from 'embla-carousel-react';
import Link from 'next/link';
import { memo, useContext, type FC } from 'react';
import {
  CommentToggleValueContext,
  DirectionValueContext,
  LayoutValueContext,
  MenuToggleValueContext,
} from './Context';

interface ViewerProps {
  emblaRef: UseEmblaCarouselType[0];
  images: string[];
  nextChapterUrl: string;
  hasNextChapter: boolean;
}

const Viewer: FC<ViewerProps> = ({
  emblaRef,
  images,
  nextChapterUrl,
  hasNextChapter,
}) => {
  const menuToggle = useContext(MenuToggleValueContext);
  const commentToggle = useContext(CommentToggleValueContext);
  const layout = useContext(LayoutValueContext);
  const direction = useContext(DirectionValueContext);

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
        {/* Viewer */}
        {images.map((image, idx) => (
          <div
            key={idx}
            className={`${classes.mt_page} ${classes.mt_placeholder} ${
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
              src={image}
              alt={`Trang ${idx + 1}`}
              style={{
                ...(layout === 'VERTICAL' && {
                  display: 'block',
                  width: 'auto',
                  height: 'auto',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  minHeight: '35px',
                }),
                ...(layout !== 'VERTICAL' && {
                  objectFit: 'scale-down',
                  width: '100%',
                  height: '100%',
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
        {layout === 'DOUBLE' && images.length % 2 !== 0 && (
          <div className="min-w-0 w-full h-full shrink-0 grow-0 basis-1/2" />
        )}
        <div className="relative min-w-0 w-full h-full shrink-0 grow-0 basis-full flex justify-center items-center">
          <div className="relative max-w-sm flex flex-col justify-center items-center gap-2 p-2.5 rounded-lg border border-primary/30">
            <p className="text-2xl text-center">
              {hasNextChapter ? 'Tiếp theo' : 'Đã là chương mới nhất'}
            </p>
            <Link
              aria-label="end chapter link button"
              href={nextChapterUrl}
              className={buttonVariants({
                variant: 'secondary',
                className: 'w-full',
              })}
            >
              <span className="line-clamp-1">
                {hasNextChapter ? 'Chuơng tiếp theo' : 'Thông tin truyện'}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Viewer);
