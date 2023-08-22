'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { useIntersection } from '@mantine/hooks';
import type { Chapter, Manga } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { FC, useEffect, useRef, useState } from 'react';
import HorizontalViewChapter from './HorizontalViewChapter';
import VerticalViewChapter from './VerticalViewChapter';

const ChapterControll = dynamic(() => import('./ChapterControll'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-24 rounded-md animate-pulse dark:bg-zinc-900" />
  ),
});
const ChapterProgressBar = dynamic(() => import('./ChapterProgressBar'));

interface ViewChapterProps {
  chapter: Pick<
    Chapter,
    'id' | 'name' | 'chapterIndex' | 'images' | 'volume'
  > & {
    manga: Pick<Manga, 'id' | 'name'>;
  };
  chapterList:
    | Pick<Chapter, 'id' | 'chapterIndex' | 'name' | 'volume' | 'isPublished'>[]
    | null;
}

const ViewChapter: FC<ViewChapterProps> = ({ chapter, chapterList }) => {
  const { serverErrorToast } = useCustomToast();
  const { mutate: IncreaseView } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(
        `/api//manga/${chapter.manga.id}/chapter/${chapter.id}`
      );

      return data;
    },
    onError: () => {
      return serverErrorToast();
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
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { ref, entry } = useIntersection({
    root: imageRef.current,
    threshold: 0,
  });

  const ReadingModeHanlder = (mode: 'vertical' | 'horizontal') => {
    localStorage.setItem('readingMode', mode);
    setReadingMode(mode);
  };
  const progressBarHandler = (mode: 'hidden' | 'fixed' | 'lightbar') => {
    localStorage.setItem('progressBar', mode);
    setProgressBar(mode);
  };
  const slideLeft = () => {
    if (currentImage === 0) return;

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

  useEffect(() => {
    sessionStorage.setItem('startPage', `${Date.now()}`);
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
        const target = document.getElementById(`${idx}`) as HTMLImageElement;
        observer.observe(target);

        return () => {
          observer.unobserve(target);
        };
      });

      const init = () => {
        const handler = () => {
          if (window.scrollY <= 200) {
            slider.current?.scrollIntoView({ behavior: 'instant' });
          }

          if (slider.current?.scrollTop === 0) {
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
          }
        };

        slider.current?.addEventListener('scroll', handler);

        return () => slider.current?.removeEventListener('scroll', handler);
      };
      init();

      const target = document.getElementById(
        `${chapter.images.length}`
      ) as HTMLDivElement;
      observer.observe(target);

      return () => {
        observer.unobserve(target);
      };
    }
  }, [chapter.images, readingMode]);
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      entry?.isIntersecting &&
      'startPage' in sessionStorage
    ) {
      if (
        Date.now() - parseInt(sessionStorage.getItem('startPage')!) >
        30 * 1000
      ) {
        sessionStorage.removeItem('startPage');
        IncreaseView();
      }
    }
  }, [IncreaseView, entry]);

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
            imageRef={ref}
            chapter={chapter}
            chapterList={chapterList}
            slideLeft={slideLeft}
            slideRight={slideRight}
            hasPrevImage={currentImage >= 0}
            hasNextImage={currentImage < chapter.images.length}
          />
        ) : (
          <VerticalViewChapter
            ref={slider}
            imageRef={ref}
            chapter={chapter}
            chapterList={chapterList}
          />
        )}

        <ChapterProgressBar
          currentImage={currentImage}
          totalImage={chapter.images}
          progressBar={progressBar}
          jumptoImage={jumptoImageHandler}
        />
      </div>
    </div>
  );
};

export default ViewChapter;
