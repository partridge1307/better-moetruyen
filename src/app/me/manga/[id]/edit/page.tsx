import { db } from '@/lib/db';
import { tagGroupByCategory } from '@/lib/query';
import { notFound } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import ForceSignOut from '@/components/ForceSignOut';
import { getAuthSession } from '@/lib/auth';
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
  const session = await getAuthSession();
  if (!session) return <ForceSignOut />;

  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
  });
  if (!user) return <ForceSignOut />;

  const manga = await db.manga.findFirst({
    where: {
      id: +params.id,
      creatorId: user.id,
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
