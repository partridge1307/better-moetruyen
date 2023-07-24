'use client';

import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Chapter } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { FC, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/HoverCard';
import ChapterControll from './ChapterControll';
import HorizontalViewChapter from './HorizontalViewChapter';
import VerticalViewChapter from './VerticalViewChapter';

interface ViewChapterProps {
  chapter: Pick<
    Chapter,
    'id' | 'name' | 'chapterIndex' | 'volume' | 'images'
  > & {
    manga: {
      name: string;
      id: number;
    };
  };
  chapterList:
    | Pick<Chapter, 'id' | 'chapterIndex' | 'name' | 'volume' | 'isPublished'>[]
    | null;
}

const ViewChapter: FC<ViewChapterProps> = ({ chapter, chapterList }) => {
  const { mutate: IncreaseView } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(
        `/api//manga/${chapter.manga.id}/chapter/${chapter.id}`
      );

      return data;
    },
    onError: () => {
      return toast({
        title: 'Có lỗi xảy ra',
        description: 'Vui lòng liên hệ Admin để được hỗ trợ',
        variant: 'destructive',
      });
    },
  });
  const [currentImage, setCurrentImage] = useState(0);
  const [readingMode, setReadingMode] = useState<'vertical' | 'horizontal'>(
    'vertical'
  );
  const [progressBar, setProgressBar] = useState<
    'hidden' | 'fixed' | 'lightbar'
  >('hidden');
  const slider = useRef<HTMLDivElement | null>(null);
  const currentImageRef = useRef<HTMLImageElement | null>(null);
  const { ref: imageRef, inView } = useInView({
    threshold: 0,
  });

  const ReadingModeHanlder = (mode: 'vertical' | 'horizontal') => {
    localStorage.setItem('readingMode', mode);
    setReadingMode(mode);
  };
  const slideLeft = () => {
    if (slider.current !== null) {
      const target = document.getElementById(
        `${currentImage - 1}`
      ) as HTMLImageElement;
      currentImageRef.current = target;
      currentImageRef.current.scrollIntoView({ behavior: 'smooth' });
      setCurrentImage(currentImage - 1);
    }
  };
  const slideRight = () => {
    if (slider.current !== null) {
      const target = document.getElementById(
        `${currentImage + 1}`
      ) as HTMLImageElement;

      currentImageRef.current = target;
      currentImageRef.current.scrollIntoView({ behavior: 'smooth' });
      setCurrentImage(currentImage + 1);
    }
  };
  const IndexInputHandler = (idx: number) => {
    if (slider.current !== null) {
      const target = document.getElementById(`${idx}`) as HTMLImageElement;
      currentImageRef.current = target;
      currentImageRef.current.scrollIntoView({ behavior: 'instant' });
      setCurrentImage(idx);
    }
  };
  const jumptoImageHandler = (idx: number) => {
    if (slider.current !== null) {
      const target = document.getElementById(`${idx}`) as HTMLImageElement;
      currentImageRef.current = target;
      currentImageRef.current.scrollIntoView({ behavior: 'instant' });

      setCurrentImage(idx);
    }
  };
  const progressBarHandler = (mode: 'hidden' | 'fixed' | 'lightbar') => {
    localStorage.setItem('progressBar', mode);
    setProgressBar(mode);
  };

  useEffect(() => {
    localStorage.setItem('startPage', `${Date.now()}`);
    localStorage.readingMode === 'horizontal'
      ? setReadingMode('horizontal')
      : null;
    localStorage.progressBar === 'lightbar'
      ? setProgressBar('lightbar')
      : localStorage.progressBar === 'fixed'
      ? setProgressBar('fixed')
      : null;
  }, []);
  useEffect(() => {
    if (readingMode === 'vertical') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setCurrentImage(Number(entry.target.id));
          }
        },
        { threshold: 0.4 }
      );

      chapter.images.map((_, idx) => {
        if (idx === chapter.images.length - 1) {
          const target = document.getElementById(`${idx}`) as HTMLImageElement;
          observer.observe(target);

          const chapterEndTarget = document.getElementById(
            `${chapter.images.length}`
          ) as HTMLDivElement;
          observer.observe(chapterEndTarget);

          return () => {
            observer.unobserve(target);
            observer.unobserve(chapterEndTarget);
          };
        } else {
          const target = document.getElementById(`${idx}`) as HTMLImageElement;
          observer.observe(target);

          return () => {
            observer.unobserve(target);
          };
        }
      });

      const handler = () => {
        if (typeof window !== 'undefined' && slider.current !== null) {
          if (window.scrollY < 150) {
            slider.current?.scrollIntoView({ behavior: 'instant' });
          }
        }
      };

      slider.current?.addEventListener('scroll', handler);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      return () => slider.current?.removeEventListener('scroll', handler);
    }
  }, [chapter.images, readingMode]);
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      inView &&
      'startPage' in localStorage
    ) {
      if (Date.now() - +localStorage.startPage > 30 * 1000) {
        localStorage.removeItem('startPage');
        IncreaseView();
      }
    }
  }, [IncreaseView, inView]);

  return (
    <div className="h-full space-y-16">
      <div className="container mx-auto space-y-4 px-3">
        <ChapterControll
          currentImage={currentImage}
          chapter={chapter}
          chapterList={chapterList}
          setCurrentImage={IndexInputHandler}
          readingMode={readingMode}
          setReadingMode={ReadingModeHanlder}
          progressBar={progressBar}
          setProgressBar={progressBarHandler}
        />
      </div>
      <div className="relative h-full w-full">
        {readingMode === 'horizontal' ? (
          <HorizontalViewChapter
            ref={slider}
            chapter={chapter}
            slideLeft={slideLeft}
            slideRight={slideRight}
            imageRef={imageRef}
            currentImage={currentImage}
            currentChapterId={chapter.id}
            currentChapterIndex={chapter.chapterIndex}
            chapterList={chapterList}
            mangaId={chapter.manga.id}
          />
        ) : (
          <VerticalViewChapter
            ref={slider}
            chapter={chapter}
            imageRef={imageRef}
            chapterList={chapterList}
            currentChapterIndex={chapter.chapterIndex}
            mangaId={chapter.manga.id}
            currentChapterId={chapter.id}
          />
        )}

        {currentImage < chapter.images.length && (
          <div
            className={cn(
              'absolute bottom-0 flex h-8 w-full items-center gap-2 rounded-full p-2 px-6 transition-all dark:hover:bg-zinc-700 max-sm:hidden',
              progressBar === 'hidden'
                ? 'opacity-0 hover:opacity-100'
                : progressBar === 'lightbar'
                ? 'items-end p-0 dark:hover:bg-transparent gap-[0.15rem] h-6'
                : null
            )}
          >
            {chapter.images.map((_, idx) => (
              <HoverCard key={idx} openDelay={100} closeDelay={100}>
                {progressBar === 'lightbar' ? (
                  <HoverCardTrigger asChild>
                    <div
                      className="relative h-3/4 w-full cursor-pointer rounded-t-md transition-all bg-gradient-to-t dark:from-zinc-900/70"
                      onClick={() => jumptoImageHandler(idx)}
                    >
                      <div
                        className={cn(
                          'absolute bottom-0 h-[.15rem] w-full rounded-md',
                          idx <= currentImage
                            ? 'dark:bg-orange-500'
                            : 'dark:bg-zinc-900'
                        )}
                      />
                    </div>
                  </HoverCardTrigger>
                ) : (
                  <HoverCardTrigger
                    className={cn(
                      'h-1/3 w-full cursor-pointer rounded-md transition-all hover:h-full dark:bg-zinc-900',
                      idx <= currentImage ? 'dark:bg-orange-500' : null,
                      progressBar === 'hidden' ? 'h-2/5' : null
                    )}
                    onClick={() => jumptoImageHandler(idx)}
                  />
                )}
                <HoverCardContent className="w-fit rounded-2xl p-3 dark:bg-zinc-900/80 dark:text-white">
                  {idx + 1}
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewChapter;
