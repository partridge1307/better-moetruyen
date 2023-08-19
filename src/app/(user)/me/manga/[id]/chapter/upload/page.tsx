import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { notFound, redirect } from 'next/navigation';
const ChapterUpload = dynamic(
  () => import('@/components/Manage/ChapterUpload'),
  { ssr: false, loading: () => <Loader2 className="w-6 h-6 animate-spin" /> }
);

const page = async ({ params }: { params: { id: string } }) => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const manga = await db.manga.findFirst({
    where: {
      id: +params.id,
      creatorId: session.user.id,
    },
    select: {
      id: true,
    },
  });
  if (!manga) return notFound();

  return <ChapterUpload id={params.id} />;
};

export default page;
