import ForceSignOut from '@/components/ForceSignOut';
import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { redirect } from 'next/navigation';
const DataChapterTable = dynamic(
  () => import('@/components/Manage/Table/Chapter/DataChapterTable'),
  {
    ssr: false,
    loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
  }
);

const page = async ({ params }: { params: { id: string } }) => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const [user, chapters] = await db.$transaction([
    db.user.findFirst({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
      },
    }),
    db.manga
      .findUnique({
        where: {
          id: +params.id,
          creatorId: session.user.id,
        },
      })
      .chapter({
        select: {
          id: true,
          name: true,
          isPublished: true,
          mangaId: true,
          updatedAt: true,
          images: true,
        },
      }),
  ]);
  if (!user) return <ForceSignOut />;

  return (
    <div className="min-h-[400px] md:min-h-[500px]">
      {chapters && chapters.length ? (
        <div className="flex flex-col">
          <Link
            href={`/me/manga/${params.id}/chapter/upload`}
            className={cn(
              buttonVariants(),
              'self-end rounded-lg max-sm:w-full mr-1'
            )}
          >
            Thêm chapter
          </Link>
          <DataChapterTable data={chapters} />
        </div>
      ) : (
        <div className="min-h-[400px] md:min-h-[500px] flex h-full flex-col items-center justify-center gap-4">
          <p>Truyện chưa có chapter nào cả</p>
          <Link
            href={`/me/manga/${params.id}/chapter/upload`}
            className={buttonVariants()}
          >
            Thêm chapter
          </Link>
        </div>
      )}
    </div>
  );
};

export default page;
