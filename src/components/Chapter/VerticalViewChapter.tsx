import type { Chapter, Manga } from '@prisma/client';
import Image from 'next/image';
import { forwardRef, Suspense, lazy, memo } from 'react';
import NextChapterButton from './NextChapterButton';
import PrevChapterButton from './PrevChapterButton';
import { Loader2, MessagesSquare } from 'lucide-react';
const Comment = lazy(() => import('@/components/Comment/Chapter'));
const MoetruyenEditor = lazy(
  () => import('@/components/Editor/MoetruyenEditor')
);

interface VerticalViewChapterProps {
  chapter: Pick<Chapter, 'images'> & {
    manga: Pick<Manga, 'name'>;
  };
  // eslint-disable-next-line no-unused-vars
  imageRef: (node: Element | null | undefined) => void;
  chapterList:
    | Pick<Chapter, 'id' | 'chapterIndex' | 'name' | 'volume' | 'isPublished'>[]
    | null;
  currentChapterIndex: number;
  mangaId: number;
  currentChapterId: number;
}

const VerticalViewChapter = forwardRef<
  HTMLDivElement,
  VerticalViewChapterProps
>(
  (
    {
      chapter,
      imageRef,
      chapterList,
      currentChapterIndex,
      mangaId,
      currentChapterId,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className="no-scrollbar h-full w-full space-y-2 overflow-auto md:space-y-10"
      >
        {chapter.images.map((img, idx) => {
          if (idx === Math.floor(chapter.images.length * 0.7)) {
            return (
              <div
                key={`${idx}`}
                id={`${idx}`}
                className="relative h-fit w-full"
              >
                <Image
                  ref={imageRef}
                  width={0}
                  height={0}
                  priority
                  sizes="0%"
                  src={img}
                  alt={`Trang ${idx + 1}`}
                  tabIndex={-1}
                  className="w-4/5 object-contain max-sm:w-full md:mx-auto"
                />
              </div>
            );
          } else {
            return (
              <div
                key={`${idx}`}
                id={`${idx}`}
                className="relative h-fit w-full"
              >
                <Image
                  width={0}
                  height={0}
                  sizes="0%"
                  priority
                  src={img}
                  alt={`Trang ${idx + 1}`}
                  tabIndex={-1}
                  className="w-4/5 object-contain max-sm:w-full md:mx-auto"
                />
              </div>
            );
          }
        })}

        <div
          id={`${chapter.images.length}`}
          className="h-full w-full md:w-4/5 md:mx-auto p-4 space-y-20"
        >
          <div className="flex justify-between">
            <PrevChapterButton
              chapterList={chapterList}
              currentChapterIndex={currentChapterIndex}
              className="transition-transform hover:-translate-x-4"
            />
            <NextChapterButton
              chapterList={chapterList}
              currentChapterIndex={currentChapterIndex}
              className="transition-transform hover:translate-x-4"
            />
          </div>

          <div>
            <p className="flex items-center gap-2 text-lg">
              Bình luận
              <MessagesSquare className="w-5 h-5" />
            </p>

            <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin" />}>
              <MoetruyenEditor id={`${mangaId}`} chapterId={currentChapterId} />
              <Comment mangaId={mangaId} chapterId={currentChapterId} />
            </Suspense>
          </div>
        </div>
      </div>
    );
  }
);

VerticalViewChapter.displayName = 'VerticalViewChapter';

export default memo(VerticalViewChapter);
