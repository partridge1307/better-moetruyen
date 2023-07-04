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
        },
      },
    },
  });
  if (!chapter) return notFound();

  return (
    <div className="mt-8 h-full">
      <ViewChapter chapter={chapter} />
    </div>
  );
};

export default page;
