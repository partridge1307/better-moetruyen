import { db } from '@/lib/db';
import { tagGroupByCategory } from '@/lib/query';
import { notFound } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
const EditManga = dynamic(() => import('@/components/Manage/EditManga'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
});

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
