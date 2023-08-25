import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { notFound, redirect } from 'next/navigation';
const DataMangaTable = dynamic(
  () => import('@/components/Manage/Table/Manga/DataMangaTable'),
  {
    ssr: false,
    loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
  }
);

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const manga = await db.user
    .findUnique({
      where: {
        id: session.user.id,
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
  if (!manga) return notFound();

  return (
    <div className="min-h-[400px] md:min-h-[500px]">
      {!!manga?.length ? (
        <DataMangaTable data={manga} />
      ) : (
        <div className="min-h-[400px] md:min-h-[500px] flex items-center justify-center">
          Bạn chưa có manga nào. Hãy upload một bộ ngay thôi nhé
        </div>
      )}
    </div>
  );
};

export default page;