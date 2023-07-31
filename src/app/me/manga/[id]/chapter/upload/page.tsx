import ForceSignOut from '@/components/ForceSignOut';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
const ChapterUpload = dynamic(
  () => import('@/components/Manage/ChapterUpload'),
  { ssr: false, loading: () => <Loader2 className="w-6 h-6 animate-spin" /> }
);

const page = async ({ params }: { params: { id: string } }) => {
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

  const manga = await db.manga.findFirst({
    where: {
      id: +params.id,
      creatorId: user.id,
    },
    select: {
      id: true,
    },
  });
  if (!manga) return notFound();

  return <ChapterUpload id={params.id} />;
};

export default page;
