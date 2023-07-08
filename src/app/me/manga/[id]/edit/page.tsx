import EditManga from '@/components/Manage/EditManga';
import { db } from '@/lib/db';
import { tagGroupByCategory } from '@/lib/query';
import { notFound } from 'next/navigation';
import { FC } from 'react';

interface pageProps {
  params: {
    id: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const manga = await db.manga.findFirst({
    where: {
      id: +params.id,
    },
    include: {
      author: true,
      tags: true,
    },
  });
  if (!manga) return notFound();

  const tags = await tagGroupByCategory();

  return <EditManga manga={manga} tags={tags} />;
};

export default page;
