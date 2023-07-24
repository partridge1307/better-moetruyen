import ForceSignOut from '@/components/ForceSignOut';
import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { columns } from './column';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
const DataChapterTable = dynamic(() => import('./DataChapterTable'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
});

const page = async ({ params }: { params: { id: string } }) => {
  const session = await getAuthSession();
  if (!session) return <ForceSignOut />;
  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
    },
  });
  if (!user) return <ForceSignOut />;

  const chapters = await db.manga
    .findUnique({
      where: {
        id: +params.id,
        creatorId: user.id,
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
    });

  return (
    <div className="min-h-[400px] md:min-h-[500px]">
      {chapters && chapters.length ? (
        <div className="flex flex-col">
          <Link
            href={`/me/manga/${params.id}/chapter/upload`}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'self-end rounded-lg max-sm:w-full'
            )}
          >
            Thêm chapter
          </Link>
          {/* @ts-ignore */}
          <DataChapterTable columns={columns} data={chapters} />
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-4">
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
