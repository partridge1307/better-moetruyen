import type { Chapter, Manga } from '@prisma/client';
import { ChevronLeft, Loader2, MessagesSquare } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { forwardRef, memo } from 'react';
import { Button } from '../ui/Button';
import PrevChapterButton from './PrevChapterButton';
import NextChapterButton from './NextChapterButton';
const Comment = dynamic(() => import('@/components/Comment/Chapter'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
});

interface HorizontalViewChapterProps {
  chapter: Pick<Chapter, 'images'> & {
    manga: Pick<Manga, 'name'>;
  };
  slideLeft(): void;
  slideRight(): void;
  imageRef: (element: any) => void;
  currentChapterId: number;
  currentChapterIndex: number;
  chapterList:
    | Pick<Chapter, 'id' | 'chapterIndex' | 'name' | 'volume' | 'isPublished'>[]
    | null;
  mangaId: number;
  hasPrevImage: boolean;
  hasNextImage: boolean;
}

const HorizontalViewChapter = forwardRef<
  HTMLDivElement,
  HorizontalViewChapterProps
>(
  (
    {
      chapter,
      slideLeft,
      slideRight,
      imageRef,
      currentChapterId,
      currentChapterIndex,
      chapterList,
      mangaId,
      hasPrevImage,
      hasNextImage,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className="flex h-full w-full overflow-hidden scroll-smooth"
      >
        {chapter.images.map((img, idx) => {
          if (idx === Math.floor(chapter.images.length * 0.7)) {
            return (
              <div
                id={`${idx}`}
                key={idx}
                className="relative h-full w-full shrink-0"
              >
                <Image
                  ref={imageRef}
                  fill
                  sizes="100vw"
                  priority
                  tabIndex={-1}
                  src={img}
                  alt={chapter.manga.name}
                  className="object-contain"
                />
              </div>
            );
          } else {
            return (
              <div
                id={`${idx}`}
                key={idx}
                className="relative h-full w-full shrink-0"
              >
                <Image
                  fill
                  sizes="100vw"
                  priority
                  tabIndex={-1}
                  src={img}
                  alt={chapter.manga.name}
                  className="object-contain"
                />
              </div>
            );
          }
        })}

        <div
          id={`${chapter.images.length}`}
          className="relative h-full w-full shrink-0 flex justify-center items-center"
        >
          <div className="w-1/2 h-2/3 p-2 rounded-lg dark:bg-zinc-700 flex flex-col items-center justify-between">
            <Button
              className="flex items-center justify-center gap-2 self-start hover:dark:bg-zinc-800"
              variant={'ghost'}
              onClick={slideLeft}
            >
              <ChevronLeft className="w-5 h-5" />
              Quay lại
            </Button>

            <div className="space-y-6">
              <PrevChapterButton
                chapterList={chapterList}
                currentChapterIndex={currentChapterIndex}
                className="w-96 transition-transform hover:-translate-x-12"
              />
              <NextChapterButton
                chapterList={chapterList}
                currentChapterIndex={currentChapterIndex}
                className="w-96 transition-transform hover:translate-x-12"
              />
            </div>

            <Button
              className="flex items-center justify-center gap-2 self-end hover:dark:bg-zinc-800"
              variant={'ghost'}
              onClick={() => {
                const target = document.getElementById(
                  'comment-horizontal-section'
                ) as HTMLDivElement;

                target.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Bình luận
              <MessagesSquare className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div
          id="comment-horizontal-section"
          className="relative h-full w-full shrink-0"
        >
          <div className="container py-10 space-y-20">
            <Button
              className="flex items-center justify-center gap-2 hover:dark:bg-zinc-700"
              variant={'ghost'}
              onClick={() => {
                const target = document.getElementById(
                  `${chapter.images.length}`
                ) as HTMLDivElement;

                target.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <ChevronLeft className="w-5 h-5" />
              Quay lại
            </Button>

            <Comment mangaId={mangaId} chapterId={currentChapterId} />
          </div>
        </div>

        {!hasNextImage && (
          <>
            <button
              onClick={slideLeft}
              disabled={!hasPrevImage}
              className="absolute left-0 h-full w-2/5 opacity-0"
            />
            <button
              onClick={slideRight}
              className="absolute right-0 h-full w-2/5 opacity-0"
            />
          </>
        )}
      </div>
    );
  }
);

HorizontalViewChapter.displayName = 'HorizontalViewChapter';

export default memo(HorizontalViewChapter);
