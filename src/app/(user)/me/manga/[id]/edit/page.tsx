import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { tagGroupByCategory } from '@/lib/query';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
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
  if (!session) return redirect('/sign-in');

  const [manga, tags] = await Promise.all([
    db.manga.findFirst({
      where: {
        id: +params.id,
        creatorId: session.user.id,
      },
      select: {
        author: true,
        tags: true,
        id: true,
        name: true,
        description: true,
        review: true,
        altName: true,
        image: true,
        facebookLink: true,
        discordLink: true,
      },
    }),
    tagGroupByCategory(),
  ]);
  if (!manga) return notFound();

  return <EditManga manga={manga} tags={tags} />;
};

export default page;
