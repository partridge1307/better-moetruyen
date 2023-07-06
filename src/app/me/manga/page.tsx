import DataMangaTable from '@/app/me/manga/DataMangaTable';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { columns } from './column';

const page = async () => {
  const session = await getAuthSession();
  if (!session) redirect('/sign-in');
  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
  });
  if (!user) return redirect('/sign-in');

  const manga = await db.manga.findMany({
    where: {
      creatorId: user.id,
    },
  });

  return !!manga.length ? (
    <DataMangaTable columns={columns} data={manga} />
  ) : (
    <div>Bạn chưa có manga nào. Hãy upload một bộ ngay thôi nhé</div>
  );
};

export default page;
