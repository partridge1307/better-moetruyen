'use client';

import ProgressBarViewChapterSkeleton from '@/components/Skeleton/ProgressBarViewChapterSkeleton';
import VerticalViewChapterSkeleton from '@/components/Skeleton/VerticalViewChapterSkeleton';
import ViewChapterControllSkeleton from '@/components/Skeleton/ViewChapterControllSkeleton';
import type { Chapter, Manga } from '@prisma/client';
import dynamic from 'next/dynamic';
import {
  Dispatch,
  FC,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from 'react';

const Controll = dynamic(() => import('./Controll'), {
  ssr: false,
  loading: () => <ViewChapterControllSkeleton />,
});
const VeritcalViewChapter = dynamic(() => import('./Vertical'), {
  ssr: false,
  loading: () => <VerticalViewChapterSkeleton />,
});
const HorizontalViewChapter = dynamic(() => import('./Horizontal'), {
  ssr: false,
  loading: () => <VerticalViewChapterSkeleton />,
});
const Progress = dynamic(() => import('./Progress'), {
  ssr: false,
  loading: () => <ProgressBarViewChapterSkeleton />,
});

interface indexProps {
  chapter: Pick<
    Chapter,
    'id' | 'volume' | 'chapterIndex' | 'name' | 'images' | 'blurImages'
  > & {
    manga: Pick<Manga, 'slug' | 'name'>;
  };
  chapterList: Pick<Chapter, 'id' | 'volume' | 'chapterIndex' | 'name'>[];
}

export type ReadingType = 'VERTICAL' | 'HORIZONTAL';
export type ProgressBarType = 'SHOW' | 'HIDE' | 'LIGHTBAR';
export type SizeType = 'ORIGINAL' | 'FITWIDTH' | 'FITHEIGHT';

export const ReadingModeContext = createContext<{
  readingMode: ReadingType;
  onReadingModeChange: Dispatch<SetStateAction<ReadingType>>;
}>({ readingMode: 'VERTICAL', onReadingModeChange: () => {} });

export const ProgressBarContext = createContext<{
  progressBar: ProgressBarType;
  onProgressBarChange: Dispatch<SetStateAction<ProgressBarType>>;
}>({ progressBar: 'SHOW', onProgressBarChange: () => {} });

export const SizeContext = createContext<{
  size: SizeType;
  onSizeChange: Dispatch<SetStateAction<SizeType>>;
}>({ size: 'ORIGINAL', onSizeChange: () => {} });

export const CurrentPageContext = createContext<{
  currentPage: number;
  onPageChange: Dispatch<SetStateAction<number>>;
}>({ currentPage: 0, onPageChange: () => {} });

export const ImageContext = createContext<{
  images: HTMLImageElement[];
  setImages: Dispatch<SetStateAction<HTMLImageElement[]>>;
}>({ images: [], setImages: () => {} });

const ViewChapter: FC<indexProps> = ({ chapter, chapterList }) => {
  const [readingMode, onReadingModeChange] = useState<ReadingType>('VERTICAL');
  const [progressBar, onProgressBarChange] = useState<ProgressBarType>('SHOW');
  const [size, onSizeChange] = useState<SizeType>('ORIGINAL');
  const [currentPage, onPageChange] = useState(0);
  const [images, setImages] = useState<HTMLImageElement[]>([]);

  useEffect(() => {
    const readingType = localStorage.readingMode as ReadingType;
    if (readingType === 'HORIZONTAL') onReadingModeChange('HORIZONTAL');

    const sizeType = localStorage.sizeType as SizeType;
    if (sizeType === 'FITHEIGHT') onSizeChange('FITHEIGHT');
    else if (sizeType === 'FITWIDTH') onSizeChange('FITWIDTH');

    const progressBarType = localStorage.progressBar as ProgressBarType;
    if (progressBarType === 'LIGHTBAR') onProgressBarChange('LIGHTBAR');
    else if (progressBarType === 'HIDE') onProgressBarChange('HIDE');

    sessionStorage.setItem('startPage', `${Date.now()}`);
  }, []);

  useEffect(() => {
    setImages([]);
  }, [readingMode]);

  useEffect(() => {
    setImages([]);
  }, [size]);

  return (
    <ReadingModeContext.Provider value={{ readingMode, onReadingModeChange }}>
      <ProgressBarContext.Provider value={{ progressBar, onProgressBarChange }}>
        <CurrentPageContext.Provider value={{ currentPage, onPageChange }}>
          <ImageContext.Provider value={{ images, setImages }}>
            <SizeContext.Provider value={{ size, onSizeChange }}>
              <Controll chapter={chapter} chapterList={chapterList} />

              {readingMode === 'VERTICAL' ? (
                <VeritcalViewChapter
                  chapter={chapter}
                  chapterList={chapterList}
                />
              ) : (
                <HorizontalViewChapter
                  chapter={chapter}
                  chapterList={chapterList}
                />
              )}

              <Progress />
            </SizeContext.Provider>
          </ImageContext.Provider>
        </CurrentPageContext.Provider>
      </ProgressBarContext.Provider>
    </ReadingModeContext.Provider>
  );
};

export default ViewChapter;
