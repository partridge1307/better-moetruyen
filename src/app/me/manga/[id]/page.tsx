import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';

interface pageProps {
  params: {
    id: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
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
