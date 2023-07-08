import ForceSignOut from '@/components/ForceSignOut';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { columns } from './column';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
const DataMangaTable = dynamic(() => import('@/app/me/manga/DataMangaTable'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
});

const page = async () => {
  const session = await getAuthSession();
  if (!session) return <ForceSignOut />;
  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
  });
  if (!user) return <ForceSignOut />;

  const manga = await db.user
    .findUnique({
      where: {
        id: user.id,
      },
    })
    .manga();

  return !!manga?.length ? (
    // @ts-ignore
    <DataMangaTable columns={columns} data={manga} />
  ) : (
    <div>Bạn chưa có manga nào. Hãy upload một bộ ngay thôi nhé</div>
  );
};

export default page;
