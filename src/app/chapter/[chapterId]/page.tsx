import ViewChapter from '@/components/Chapter/ViewChapter';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { FC } from 'react';

interface pageProps {
  params: {
    chapterId: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const chapter = await db.chapter.findFirst({
    where: {
      id: parseInt(params.chapterId),
    },
    include: {
      manga: {
        select: {
          name: true,
          id: true,
          isPublished: true,
        },
      },
    },
  });
  if (!chapter || !chapter.manga.isPublished) return notFound();
  const mangaChapterList = await db.manga.findFirst({
    where: {
      id: chapter.manga.id,
    },
    select: {
      chapter: {
        select: {
          id: true,
          chapterIndex: true,
          volume: true,
          name: true,
        },
      },
    },
  });
  if (!mangaChapterList) return notFound();

  const currentChapterIdx = mangaChapterList.chapter.findIndex(
    (c) => c.id === chapter.id
  );
  const nextChapter = mangaChapterList.chapter[currentChapterIdx + 1];
  const prevChapter = mangaChapterList.chapter[currentChapterIdx - 1];

  return (
    <div className="mt-8 h-full">
      <ViewChapter chapter={chapter} mangaChapterList={mangaChapterList} />
    </div>
  );
};

export default page;
