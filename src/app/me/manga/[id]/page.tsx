import { db } from '@/lib/db';
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
      id: parseInt(params.id, 10),
    },
    include: {
      chapter: true,
      view: true,
    },
  });

  if (!manga) return notFound();

  return (
    <div>
      {!manga.isPublished ? (
        <div>Cần publish truyện để thống kê</div>
      ) : (
        <div>
          <div>
            <p>View của ngày hôm nay</p>
            <div></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default page;
