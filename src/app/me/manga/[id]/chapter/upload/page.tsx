import ChapterUpload from '@/components/Manage/ChapterUpload';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';

const page = async ({ params }: { params: { id: string } }) => {
  const session = await getAuthSession();
  if (!session) redirect('/sign-in');
  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
  });
  if (!user) return redirect('/sign-in');

  const manga = await db.manga.findFirst({
    where: {
      id: parseInt(params.id, 10),
      creatorId: user.id,
    },
  });
  if (!manga) return notFound();

  return <ChapterUpload id={params.id} />;
};

export default page;
