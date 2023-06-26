import ManageChapter from '@/components/ManageChapter';
import MangaUploadCard from '@/components/MangaUploadCard';
import { db } from '@/lib/db';
import { FC } from 'react';
import { notFound } from 'next/navigation';

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
      chapter: true,
    },
  });

  if (!manga) return notFound();

  return (
    <div className="container max-sm:px-0 mx-auto h-fit pt-14">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_.4fr] gap-y-4 md:gap-x-4 py-6">
        {/* TODO: Manga's chapter info */}
        <ManageChapter chapter={manga?.chapter} mangaId={params.id} />

        {/* Specific Manga Info */}
        <MangaUploadCard manga={manga} />
      </div>
    </div>
  );
};

export default page;
