import ForceSignOut from '@/components/ForceSignOut';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { columns } from './column';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { redirect } from 'next/navigation';
const DataMangaTable = dynamic(() => import('@/app/me/manga/DataMangaTable'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
});

const page = async () => {
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

  const manga = await db.user
    .findUnique({
      where: {
        id: user.id,
      },
    })
    .manga({
      select: {
        id: true,
        name: true,
        isPublished: true,
        updatedAt: true,
      },
    });

  return (
    <div className="min-h-[400px] md:min-h-[500px]">
      {!!manga?.length ? (
        // @ts-ignore
        <DataMangaTable columns={columns} data={manga} />
      ) : (
        <div className="min-h-[400px] md:min-h-[500px] flex items-center justify-center">
          Bạn chưa có manga nào. Hãy upload một bộ ngay thôi nhé
        </div>
      )}
    </div>
  );
};

export default page;
