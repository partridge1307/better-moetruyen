import type { Chapter, Manga } from '@prisma/client';
import { Loader2, MessagesSquare } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { forwardRef, memo } from 'react';
import NextChapterButton from './components/NextChapterButton';
import PrevChapterButton from './components/PrevChapterButton';

const Comments = dynamic(() => import('@/components/Comment/Chapter'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
});

interface VerticalViewChapterProps {
  chapter: Pick<Chapter, 'id' | 'images' | 'chapterIndex'> & {
    manga: Pick<Manga, 'name'>;
  };
  // eslint-disable-next-line no-unused-vars
  imageRef: (element: any) => void;
  chapterList:
    | Pick<Chapter, 'id' | 'chapterIndex' | 'name' | 'volume' | 'isPublished'>[]
    | null;
}

const VerticalViewChapter = forwardRef<
  HTMLDivElement,
  VerticalViewChapterProps
>(({ chapter, imageRef, chapterList }, ref) => {
  return (
    <div
      ref={ref}
      className="no-scrollbar h-full w-full space-y-2 overflow-auto md:space-y-10"
    >
      {chapter.images.map((img, idx) => {
        if (idx === Math.floor(chapter.images.length * 0.7)) {
          return (
            <div key={`${idx}`} id={`${idx}`} className="relative w-full">
              <Image
                ref={imageRef}
                width={0}
                height={0}
                sizes="100vw"
                priority
                tabIndex={-1}
                src={img}
                alt={`Trang ${idx + 1}`}
                className="object-contain w-fit mx-auto"
              />
            </div>
          );
        } else {
          return (
            <div key={`${idx}`} id={`${idx}`} className="relative w-full">
              <Image
                width={0}
                height={0}
                sizes="100vw"
                priority
                tabIndex={-1}
                src={img}
                alt={`Trang ${idx + 1}`}
                className="object-contain w-fit mx-auto"
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
            currentChapterIndex={chapter.chapterIndex}
            className="transition-transform hover:-translate-x-4"
          />
          <NextChapterButton
            chapterList={chapterList}
            currentChapterIndex={chapter.chapterIndex}
            className="transition-transform hover:translate-x-4"
          />
        </div>

        <div>
          <p className="flex items-center gap-2 text-lg">
            Bình luận
            <MessagesSquare className="w-5 h-5" />
          </p>

          <Comments id={chapter.id} />
        </div>
      </div>
    </div>
  );
});

VerticalViewChapter.displayName = 'VerticalViewChapter';

export default memo(VerticalViewChapter);
