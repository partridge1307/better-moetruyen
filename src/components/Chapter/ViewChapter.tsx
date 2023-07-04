'use client';

import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Chapter } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import { useWindowSize } from '@uidotdev/usehooks';
import axios from 'axios';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/HoverCard';
import ChapterControll from './ChapterControll';
import HorizontalViewChapter from './HorizontalViewChapter';
import VerticalViewChapter from './VerticalViewChapter';
import useOnScreen from '@/hooks/use-on-screen';

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
    'horizontal'
  );
  const slider = useRef<HTMLDivElement | null>(null);
  const currentImageRef = useRef<HTMLImageElement | null>(null);
  const { width } = useWindowSize();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const inView = useOnScreen(imageRef);

  const slideLeft = useCallback(() => {
    if (slider.current !== null) {
      slider.current.scrollLeft = slider.current.scrollLeft - width;
      setCurrentImage((prev) => prev - 1);
    }
  }, [width]);
  const slideRight = useCallback(() => {
    if (slider.current !== null) {
      slider.current.scrollLeft = slider.current.scrollLeft + width;
      setCurrentImage((prev) => prev + 1);
    }
  }, [width]);
  const IndexInputHandler = useCallback(
    (idx: number) => {
      if (slider.current !== null) {
        if (idx < currentImage) {
          slider.current.scrollLeft =
            slider.current.scrollLeft -
            (chapter.images.length - idx + 1) * width;
          setCurrentImage(idx);
        } else {
          slider.current.scrollLeft = slider.current.scrollLeft + idx * width;
          setCurrentImage(idx);
        }
      }
    },
    [chapter.images.length, currentImage, width]
  );
  const horizontalJumpToImageHandler = useCallback(
    (idx: number) => {
      if (slider.current !== null) {
        if (idx < currentImage) {
          slider.current.scrollLeft =
            slider.current.scrollLeft -
            (chapter.images.length - idx + 1) * width;
          setCurrentImage(idx);
        } else {
          slider.current.scrollLeft = slider.current.scrollLeft + idx * width;
          setCurrentImage(idx);
        }
      }
    },
    [chapter.images.length, currentImage, width]
  );
  const verticalJumpToImageHandler = useCallback((idx: number) => {
    if (slider.current !== null) {
      const target = document.getElementById(`${idx}`) as HTMLImageElement;
      currentImageRef.current = target;
      currentImageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  const ReadingModeHanlder = useCallback((mode: 'vertical' | 'horizontal') => {
    setReadingMode(mode);
  }, []);

  useEffect(() => {
    localStorage.setItem('startPage', `${Date.now()}`);
    localStorage.readingMode === 'vertical'
      ? setReadingMode('vertical')
      : setReadingMode('horizontal');
  }, []);
  useEffect(() => {
    if (readingMode === 'vertical' && slider.current) {
      const handler = () => {
        if (window.scrollY <= 260) {
          slider.current?.scrollIntoView({ behavior: 'smooth' });
        }
      };
      slider.current.addEventListener('scroll', handler);

      return () => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        slider.current?.removeEventListener('scroll', handler);
      };
    }
  }, [readingMode]);

  if (typeof window !== 'undefined' && inView && 'startPage' in localStorage) {
    if (Date.now() - parseInt(localStorage.startPage, 10) > 30 * 1000) {
      localStorage.removeItem('startPage');
      IncreaseView();
    }
  }

  if (typeof window !== 'undefined' && slider.current !== null) {
    slider.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="space-y-16 h-full">
      <div className="container mx-auto px-3 space-y-4">
        <ChapterControll
          currentImage={currentImage}
          chapter={chapter}
          setCurrentImage={IndexInputHandler}
          readingMode={readingMode}
          setReadingMode={ReadingModeHanlder}
        />

        <div className="h-4 flex items-center gap-2 max-sm:hidden">
          {chapter.images.map((_, idx) => (
            <HoverCard key={idx} openDelay={100} closeDelay={100}>
              <HoverCardTrigger
                className={cn(
                  'cursor-pointer w-full h-1/2 hover:h-full transition-all rounded-md dark:bg-zinc-900',
                  idx <= currentImage ? 'dark:bg-orange-500' : null
                )}
                onClick={() =>
                  readingMode === 'vertical'
                    ? verticalJumpToImageHandler(idx)
                    : horizontalJumpToImageHandler(idx)
                }
              />
              <HoverCardContent className="w-fit p-3 rounded-2xl dark:bg-zinc-900/80 dark:text-white">
                {idx + 1}
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </div>

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
          currentImageRef={currentImageRef}
        />
      )}
    </div>
  );
};

export default ViewChapter;
