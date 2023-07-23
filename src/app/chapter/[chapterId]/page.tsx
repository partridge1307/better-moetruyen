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
      id: +params.chapterId,
      isPublished: true,
    },
    select: {
      manga: {
        select: {
          name: true,
          id: true,
          isPublished: true,
        },
      },
      id: true,
      name: true,
      chapterIndex: true,
      images: true,
      volume: true,
    },
  });
  if (!chapter || !chapter.manga.isPublished) return notFound();

  const chapterList = await db.manga
    .findUnique({
      where: {
        id: chapter.manga.id,
      },
    })
    .chapter({
      select: {
        id: true,
        chapterIndex: true,
        name: true,
        volume: true,
        isPublished: true,
      },
    });

  return (
    <div className="mt-8 h-full">
      <ViewChapter chapter={chapter} chapterList={chapterList} />
    </div>
  );
};

export default page;
