import { getAuthSession } from '@/lib/auth';
import { cn } from '@/lib/utils';
import type { Manga, MangaFollow, User } from '@prisma/client';
import { Loader2, Settings, Upload } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';
import { buttonVariants } from '../ui/Button';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
const FollowClient = dynamic(() => import('@/components/Follow/FollowClient'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
});

interface MangaControllProps {
  manga: Pick<Manga, 'id'> & {
    creator: Pick<User, 'id'>;
  };
}

const MangaControll: FC<MangaControllProps> = async ({ manga }) => {
  const session = await getAuthSession();
  const firstChapter = await db.chapter.findFirst({
    where: {
      mangaId: manga.id,
      isPublished: true,
    },
    select: {
      id: true,
    },
    orderBy: {
      chapterIndex: 'asc',
    },
    take: 1,
  });

  let existingFollow: MangaFollow | null = null;
  if (session) {
    existingFollow = await db.mangaFollow.findFirst({
      where: {
        mangaId: manga.id,
        userId: session.user.id,
      },
    });
  }

  return (
    <div className="flex max-sm:flex-col md:items-center gap-6">
      <div className="flex items-center gap-4 md:gap-3">
        {firstChapter ? (
          <Link
            href={`/chapter/${firstChapter.id}`}
            className={cn(
              buttonVariants(),
              'bg-orange-500 hover:bg-orange-700 text-white md:text-lg text-center font-medium px-6'
            )}
          >
            Đọc từ đầu
          </Link>
        ) : null}
        {session ? (
          <FollowClient follow={existingFollow} mangaId={manga.id} />
        ) : null}
      </div>

      {manga.creator.id === session?.user.id ? (
        <div className="flex items-center gap-4">
          <Link
            href={`/me/manga/${manga.id}`}
            className={cn(buttonVariants(), 'flex items-center gap-1 w-fit')}
          >
            <Settings className="w-5 h-5" />
            <span>Chỉnh sửa</span>
          </Link>
          <Link
            href={`/me/manga/${manga.id}/chapter/upload`}
            className={cn(buttonVariants(), 'flex items-center gap-1 w-fit')}
          >
            <Upload className="w-5 h-5" />
            <span>Thêm Chapter</span>
          </Link>
        </div>
      ) : null}
    </div>
  );
};

export default MangaControll;
