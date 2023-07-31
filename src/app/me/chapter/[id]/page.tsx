import ForceSignOut from '@/components/ForceSignOut';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
const ChapterEdit = dynamic(() => import('@/components/Manage/ChapterEdit'), {
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

  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
    },
  });
  if (!user) return <ForceSignOut />;

  const chapter = await db.chapter.findFirst({
    where: {
      id: +params.id,
      manga: {
        creatorId: user.id,
      },
    },
    select: {
      id: true,
      name: true,
      chapterIndex: true,
      mangaId: true,
      volume: true,
      images: true,
    },
  });
  if (!chapter) return notFound();

  return <ChapterEdit chapter={chapter} />;
};

export default page;
