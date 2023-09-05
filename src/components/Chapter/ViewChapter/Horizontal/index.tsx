import { cn } from '@/lib/utils';
import { useWindowEvent } from '@mantine/hooks';
import Image from 'next/image';
import {
  FC,
  TouchEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { CurrentPageContext, ImageContext, SizeContext } from '..';
import Navigation from '../Navigation';
import type { Chapter } from '@prisma/client';
import { ChevronLeft, ChevronRight, MessagesSquare } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import dynamic from 'next/dynamic';

const Comments = dynamic(() => import('@/components/Comment/Chapter'), {
  ssr: false,
});

interface HorizontalViewChapterProps {
  chapter: Pick<Chapter, 'id' | 'chapterIndex' | 'images'>;
  chapterList: Pick<Chapter, 'id' | 'volume' | 'chapterIndex' | 'name'>[];
}

const minSwipeDistance = 50;

const HorizontalViewChapter: FC<HorizontalViewChapterProps> = ({
  chapter,
  chapterList,
}) => {
  const { currentPage, onPageChange } = useContext(CurrentPageContext);
  const { size } = useContext(SizeContext);
  const { images, setImages } = useContext(ImageContext);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Set images
  const setImage = (e: HTMLImageElement | null, idx: number) => {
    if (e) {
      images[idx] = e;
      setImages(images);
    }
  };

  // Current page callback change
  const callback: IntersectionObserverCallback = useCallback(
    (entries) => {
      const intersectingEntries = entries.filter(
        (entry) => entry.isIntersecting
      );

      if (intersectingEntries.length) {
        const current = images.indexOf(
          intersectingEntries[intersectingEntries.length - 1]
            .target as HTMLImageElement
        );
        const navigationIntersecting = intersectingEntries.filter(
          (entry) => entry.target.id
        );

        if (navigationIntersecting.length) {
          onPageChange(-2);
          return;
        }

        current !== -1 && onPageChange(current);
      }
    },
    [images, onPageChange]
  );

  // Scroll to first image
  useEffect(() => {
    images.find(Boolean)?.scrollIntoView({ behavior: 'smooth' });
  }, [images]);

  // Observe images
  useEffect(() => {
    const observer = new IntersectionObserver(callback, {
      threshold: size === 'ORIGINAL' ? 0.1 : 1,
    });

    if (images.length) {
      images.forEach((e) => {
        observer.observe(e);
      });

      const target = document.getElementById(
        'navigation-section'
      ) as HTMLDivElement;
      observer.observe(target);
    }

    return () => {
      observer.disconnect();
    };
  }, [callback, images, size]);

  // Scroll prev page
  const scrollPrev = useCallback(() => {
    const el = images[currentPage - 1];

    !!el && el.scrollIntoView({ behavior: 'smooth' });
  }, [currentPage, images]);

  // Scroll next page
  const scrollNext = useCallback(() => {
    const el = images[currentPage + 1];

    if (!!el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const target = document.getElementById('navigation-section');
      target?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage, images]);

  // KeyDown
  const onKeyDownHanlder = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.code === 'ArrowLeft') return scrollPrev();
    if (e.key === 'ArrowRight' || e.code === 'ArrowRight') return scrollNext();
  };
  useWindowEvent('keydown', onKeyDownHanlder);

  // Swipe, get touch start posiiion
  const onTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches.item(0).clientX);
  }, []);

  // Swipe, get touch end position
  const onTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches.item(0).clientX);
  }, []);

  // Swipe, logic check when touch end
  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;

    const isLeftSwipe = !!(distance < -minSwipeDistance);
    const isRightSwipe = !!(distance > minSwipeDistance);

    if (isLeftSwipe) scrollPrev();
    else if (isRightSwipe) scrollNext();
  }, [scrollNext, scrollPrev, touchEnd, touchStart]);

  return (
    <div
      className="relative w-full h-screen"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className={cn('flex w-full overflow-hidden', {
          'h-screen': size === 'FITHEIGHT' || size === 'FITWIDTH',
        })}
      >
        {size === 'FITWIDTH'
          ? chapter.images.map((image, idx) => (
              <div key={idx} className="relative w-full h-full shrink-0">
                <Image
                  ref={(e) => setImage(e, idx)}
                  fill
                  sizes="100vw"
                  priority
                  src={image}
                  alt={`Trang ${idx + 1}`}
                  className="object-scale-down"
                />
              </div>
            ))
          : size === 'FITHEIGHT'
          ? chapter.images.map((image, idx) => (
              <div key={idx} className="relative w-full h-full shrink-0">
                <Image
                  ref={(e) => setImage(e, idx)}
                  fill
                  sizes="100vw"
                  priority
                  src={image}
                  alt={`Trang ${idx + 1}`}
                  className="object-contain"
                />
              </div>
            ))
          : size === 'ORIGINAL'
          ? chapter.images.map((image, idx) => (
              <Image
                key={idx}
                ref={(e) => setImage(e, idx)}
                sizes="100vw"
                width={0}
                height={0}
                priority
                src={image}
                alt={`Trang ${idx + 1}`}
                className="shrink-0 w-full h-fit object-contain"
              />
            ))
          : null}

        <div
          id="navigation-section"
          className="relative w-full h-full shrink-0 container max-sm:px-2 inline-flex justify-center items-center"
        >
          <div className="w-full lg:w-2/3 h-2/3 p-4 rounded-md inline-flex flex-col items-center justify-between dark:bg-zinc-900/60">
            <button
              aria-label="scroll back to last page"
              className={cn(buttonVariants(), 'space-x-2 self-start')}
              onClick={() => {
                const el = images[images.length - 1];

                !!el && el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Quay lại</span>
            </button>

            <div className="flex flex-col gap-4">
              <Navigation
                currentChapterIdx={chapter.chapterIndex}
                chapterList={chapterList}
              />
            </div>

            <button
              aria-label="scroll to comment section"
              className={cn(buttonVariants(), 'space-x-2 self-end')}
              onClick={() => {
                const target = document.getElementById('comment-section');

                target?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Bình luận</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          id="comment-section"
          className="relative w-full shrink-0 inline-flex flex-col gap-10 pt-10"
        >
          <button
            aria-label="scroll back to navigation section"
            className={cn(buttonVariants(), 'space-x-2 self-start')}
            onClick={() => {
              const target = document.getElementById('navigation-section');

              target?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>

          <div className="flex-1 space-y-10 overflow-auto no-scrollbar pb-10">
            <h1 className="flex items-end gap-2 text-lg lg:text-xl font-semibold">
              <span>Bình luận</span>
              <MessagesSquare className="w-5 h-5" />
            </h1>
            <Comments id={chapter.id} />
          </div>
        </div>
      </div>

      <button
        aria-label="scroll previous page"
        className={cn(
          'absolute inset-y-0 w-1/3 left-0 top-0 focus:outline-none',
          {
            hidden: currentPage === -2,
          }
        )}
        disabled={currentPage === 0 || currentPage === -2}
        onClick={() => scrollPrev()}
      />
      <button
        aria-label="scroll next page"
        className={cn(
          'absolute inset-y-0 w-1/3 right-0 top-0 focus:outline-none',
          {
            hidden: currentPage === -2,
          }
        )}
        disabled={currentPage > images.length - 1 || currentPage === -2}
        onClick={() => scrollNext()}
      />
    </div>
  );
};

export default HorizontalViewChapter;
