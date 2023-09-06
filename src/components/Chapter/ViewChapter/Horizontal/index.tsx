import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useIntersection, useWindowEvent } from '@mantine/hooks';
import type { Chapter } from '@prisma/client';
import { ChevronLeft, ChevronRight, MessagesSquare } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import {
  FC,
  TouchEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { CurrentPageContext, ImageContext, SizeContext } from '..';
import Navigation from '../Navigation';

const Comments = dynamic(() => import('@/components/Comment/Chapter'), {
  ssr: false,
});

interface HorizontalViewChapterProps {
  chapter: Pick<Chapter, 'id' | 'chapterIndex' | 'images' | 'blurImages'>;
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
  const navigationRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLImageElement>(null);
  const { ref, entry } = useIntersection({
    root: anchorRef.current,
    threshold: 0.1,
  });

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

  useEffect(() => {
    if (
      entry?.isIntersecting &&
      'startPage' in sessionStorage &&
      Date.now() - parseInt(sessionStorage.getItem('startPage')!) > 30 * 1000
    ) {
      sessionStorage.removeItem('startPage');
      fetch(`/api/chapter`, {
        method: 'POST',
        body: JSON.stringify({ id: chapter.id }),
      });
    }
  }, [chapter.id, entry?.isIntersecting]);

  // Scroll to first image
  useEffect(() => {
    images.find(Boolean)?.scrollIntoView({ behavior: 'smooth' });
  }, [images]);

  // Observe images
  useEffect(() => {
    const observer = new IntersectionObserver(callback, {
      threshold: 0.1,
    });

    if (images.length) {
      images.forEach((e) => {
        observer.observe(e);
      });
    }
    navigationRef.current && observer.observe(navigationRef.current);

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

    !!el
      ? el.scrollIntoView({ behavior: 'smooth' })
      : navigationRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  // Swipe, get touch end position
  const onTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  // Swipe, logic check when touch end
  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;

    const isLeftSwipe = !!(distance < -minSwipeDistance);

    if (isLeftSwipe) scrollPrev();
    else scrollNext();
  }, [scrollNext, scrollPrev, touchEnd, touchStart]);

  return (
    <div
      className="relative w-full h-screen"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className={cn('flex w-full gap-3 lg:gap-6 overflow-hidden', {
          'h-screen': size === 'FITHEIGHT' || size === 'FITWIDTH',
        })}
      >
        {size === 'FITWIDTH'
          ? chapter.images.map((image, idx) => {
              if (idx === Math.floor(chapter.images.length * 0.7))
                return (
                  <div key={idx} className="relative w-full h-full shrink-0">
                    <Image
                      ref={(e) => {
                        ref(e);
                        setImage(e, idx);
                      }}
                      fill
                      sizes="100vw"
                      priority
                      unoptimized
                      src={image}
                      placeholder="blur"
                      blurDataURL={chapter.blurImages[idx]}
                      alt={`Trang ${idx + 1}`}
                      className="object-scale-down"
                    />
                  </div>
                );
              else
                return (
                  <div key={idx} className="relative w-full h-full shrink-0">
                    <Image
                      ref={(e) => setImage(e, idx)}
                      fill
                      sizes="100vw"
                      priority
                      unoptimized
                      src={image}
                      placeholder="blur"
                      blurDataURL={chapter.blurImages[idx]}
                      alt={`Trang ${idx + 1}`}
                      className="object-scale-down"
                    />
                  </div>
                );
            })
          : size === 'FITHEIGHT'
          ? chapter.images.map((image, idx) => {
              if (idx === Math.floor(chapter.images.length * 0.7))
                return (
                  <div key={idx} className="relative w-full h-full shrink-0">
                    <Image
                      ref={(e) => {
                        ref(e);
                        setImage(e, idx);
                      }}
                      fill
                      sizes="100vw"
                      priority
                      unoptimized
                      src={image}
                      placeholder="blur"
                      blurDataURL={chapter.blurImages[idx]}
                      alt={`Trang ${idx + 1}`}
                      className="object-contain"
                    />
                  </div>
                );
              else
                return (
                  <div key={idx} className="relative w-full h-full shrink-0">
                    <Image
                      ref={(e) => setImage(e, idx)}
                      fill
                      sizes="100vw"
                      priority
                      unoptimized
                      src={image}
                      placeholder="blur"
                      blurDataURL={chapter.blurImages[idx]}
                      alt={`Trang ${idx + 1}`}
                      className="object-contain"
                    />
                  </div>
                );
            })
          : size === 'ORIGINAL'
          ? chapter.images.map((image, idx) => {
              if (idx === Math.floor(chapter.images.length * 0.7))
                return (
                  <Image
                    key={idx}
                    ref={(e) => {
                      ref(e);
                      setImage(e, idx);
                    }}
                    sizes="100vw"
                    width={0}
                    height={0}
                    priority
                    unoptimized
                    src={image}
                    placeholder="blur"
                    blurDataURL={chapter.blurImages[idx]}
                    alt={`Trang ${idx + 1}`}
                    className="shrink-0 w-full h-fit object-contain"
                  />
                );
              else
                return (
                  <Image
                    key={idx}
                    ref={(e) => setImage(e, idx)}
                    sizes="100vw"
                    width={0}
                    height={0}
                    priority
                    unoptimized
                    src={image}
                    placeholder="blur"
                    blurDataURL={chapter.blurImages[idx]}
                    alt={`Trang ${idx + 1}`}
                    className="shrink-0 w-full h-fit object-contain"
                  />
                );
            })
          : null}

        <div
          ref={navigationRef}
          id="navigation-section"
          className={cn(
            'relative w-full h-full shrink-0 container max-sm:px-2 inline-flex justify-center items-center',
            {
              'h-screen': size === 'ORIGINAL',
            }
          )}
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
              navigationRef.current?.scrollIntoView({ behavior: 'smooth' });
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
            'hover:cursor-default': currentPage === 0 || currentPage === -2,
          }
        )}
        onClick={scrollPrev}
      />
      <button
        aria-label="scroll next page"
        className={cn(
          'absolute inset-y-0 w-1/3 right-0 top-0 focus:outline-none',
          {
            hidden: currentPage === -2,
            'hover:cursor-default':
              currentPage > images.length - 1 || currentPage === -2,
          }
        )}
        onClick={scrollNext}
      />
    </div>
  );
};

export default HorizontalViewChapter;
