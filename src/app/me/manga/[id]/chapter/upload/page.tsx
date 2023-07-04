import ChapterUpload from '@/components/Manage/ChapterUpload';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';

const page = async ({ params }: { params: { id: string } }) => {
  const manga = await db.manga.findFirst({
    where: {
      id: parseInt(params.id, 10),
    },
  });
  if (!manga) return notFound();

  return <ChapterUpload id={params.id} />;
};

export default page;
