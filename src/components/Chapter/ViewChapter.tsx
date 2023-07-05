'use client';

import useOnScreen from '@/hooks/use-on-screen';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Chapter } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/HoverCard';
import ChapterControll from './ChapterControll';
import HorizontalViewChapter from './HorizontalViewChapter';
import VerticalViewChapter from './VerticalViewChapter';

interface ViewChapterProps {
  chapter: Chapter & {
    manga: {
      name: string;
      id: number;
    };
  };
}

const ViewChapter: FC<ViewChapterProps> = ({ chapter }) => {
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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const inView = useOnScreen(imageRef);

  const ReadingModeHanlder = useCallback((mode: 'vertical' | 'horizontal') => {
    localStorage.setItem('readingMode', mode);
    setReadingMode(mode);
  }, []);
  const slideLeft = useCallback(() => {
    if (slider.current !== null) {
      const target = document.getElementById(
        `${currentImage - 1}`
      ) as HTMLImageElement;
      currentImageRef.current = target;
      currentImageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentImage]);
  const slideRight = useCallback(() => {
    if (slider.current !== null) {
      const target = document.getElementById(
        `${currentImage + 1}`
      ) as HTMLImageElement;
      currentImageRef.current = target;
      currentImageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentImage]);
  const IndexInputHandler = useCallback((idx: number) => {
    if (slider.current !== null) {
      const target = document.getElementById(`${idx}`) as HTMLImageElement;
      currentImageRef.current = target;
      currentImageRef.current.scrollIntoView({ behavior: 'instant' });
    }
  }, []);
  const jumptoImageHandler = useCallback(
    (idx: number) => {
      if (slider.current !== null) {
        const target = document.getElementById(`${idx}`) as HTMLImageElement;
        currentImageRef.current = target;
        currentImageRef.current.scrollIntoView({ behavior: 'instant' });
        if (readingMode === 'vertical') setCurrentImage(idx);
      }
    },
    [readingMode]
  );
  const progressBarHandler = useCallback(
    (mode: 'hidden' | 'fixed' | 'lightbar') => {
      localStorage.setItem('progressBar', mode);
      setProgressBar(mode);
    },
    []
  );

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
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setCurrentImage(Number(entry.target.id));
          }
        },
        { threshold: 0.4 }
      );
    } else {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setCurrentImage(Number(entry.target.id));
          }
        },
        { threshold: 1 }
      );
    }
  }, [readingMode]);
  useEffect(() => {
    chapter.images.map((_, idx) => {
      const target = document.getElementById(`${idx}`) as HTMLImageElement;
      observerRef.current?.observe(target);

      return () => {
        observerRef.current?.unobserve(target);
      };
    });
  }, [chapter.images, readingMode]);
  if (typeof window !== 'undefined' && inView && 'startPage' in localStorage) {
    if (Date.now() - parseInt(localStorage.startPage, 10) > 30 * 1000) {
      localStorage.removeItem('startPage');
      IncreaseView();
    }
  }
  if (typeof window !== 'undefined' && slider.current !== null) {
    slider.current.scrollIntoView({ behavior: 'instant' });
  }

  return (
    <div className="space-y-16 h-full">
      <div className="container mx-auto px-3 space-y-4">
        <ChapterControll
          currentImage={currentImage}
          chapter={chapter}
          setCurrentImage={(idx) => {
            IndexInputHandler(idx);
            setCurrentImage(idx);
          }}
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
          />
        ) : (
          <VerticalViewChapter
            ref={slider}
            chapter={chapter}
            imageRef={imageRef}
          />
        )}

        <div
          className={cn(
            'absolute bottom-0 px-6 p-2 w-full h-8 flex items-center gap-2 rounded-full transition-all dark:hover:bg-zinc-700 max-sm:hidden',
            progressBar === 'hidden'
              ? 'opacity-0 hover:opacity-100'
              : progressBar === 'lightbar'
              ? 'items-end p-0 dark:hover:bg-transparent'
              : null
          )}
        >
          {chapter.images.map((_, idx) => (
            <HoverCard key={idx} openDelay={100} closeDelay={100}>
              {progressBar === 'lightbar' ? (
                <HoverCardTrigger asChild>
                  <div
                    className="relative cursor-pointer w-full h-3/4 rounded-t-md transition-all bg-gradient-to-t dark:from-zinc-900/70 to-transparent"
                    onClick={() => jumptoImageHandler(idx)}
                  >
                    <div
                      className={cn(
                        'absolute bottom-0 rounded-md h-[.15rem] w-full',
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
                    'cursor-pointer w-full h-1/3 hover:h-full transition-all rounded-md dark:bg-zinc-900',
                    idx <= currentImage ? 'dark:bg-orange-500' : null,
                    progressBar === 'hidden' ? 'h-2/5' : null
                  )}
                  onClick={() => jumptoImageHandler(idx)}
                />
              )}
              <HoverCardContent className="w-fit p-3 rounded-2xl dark:bg-zinc-900/80 dark:text-white">
                {idx + 1}
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewChapter;
