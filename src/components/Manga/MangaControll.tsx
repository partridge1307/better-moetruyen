import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import type { Manga } from '@prisma/client';
import type { Session } from 'next-auth';
import { FC } from 'react';
import { Settings, Upload } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { meDomain } from '@/config';

const MangaFollow = dynamic(() => import('./components/MangaFollow'), {
  ssr: false,
  loading: () => (
    <div className="w-14 h-10 rounded-md animate-pulse dark:bg-zinc-900" />
  ),
});
const ShareButton = dynamic(() => import('@/components/ShareButton'), {
  ssr: false,
  loading: () => (
    <div className="w-28 h-10 rounded-md animate-pulse dark:bg-zinc-900" />
  ),
});

interface MangaControllProps {
  manga: Pick<Manga, 'id' | 'slug' | 'name' | 'creatorId'>;
}

async function history(session: Session | null, mangaId: number) {
  if (session) {
    const existingHistory = await db.history.findUnique({
      where: {
        userId_mangaId: {
          userId: session.user.id,
          mangaId,
        },
      },
      select: {
        id: true,
        chapterId: true,
      },
    });

    if (existingHistory) {
      await db.history.update({
        where: {
          userId_mangaId: {
            userId: session.user.id,
            mangaId,
          },
        },
        data: {
          updatedAt: new Date(Date.now()),
        },
      });
    } else {
      await db.history.create({
        data: {
          userId: session.user.id,
          mangaId,
        },
      });
    }

    return existingHistory?.chapterId ?? null;
  } else return null;
}

async function getFollow(session: Session | null, mangaId: number) {
  if (session) {
    const manga = await db.manga.findUnique({
      where: {
        id: mangaId,
        followedBy: {
          some: {
            id: session.user.id,
          },
        },
      },
      select: {
        id: true,
      },
    });

    return manga ?? null;
  } else return null;
}

const MangaControll: FC<MangaControllProps> = async ({ manga }) => {
  const [session, firstChapter] = await Promise.all([
    getAuthSession(),
    db.chapter.findFirst({
      where: {
        mangaId: manga.id,
        isPublished: true,
      },
      orderBy: {
        chapterIndex: 'asc',
      },
      select: {
        id: true,
      },
    }),
  ]);
  const [lastReadChapterId, hasFollow] = await Promise.all([
    history(session, manga.id),
    getFollow(session, manga.id),
  ]);

  return (
    <div className="flex flex-wrap items-center gap-5">
      {!!lastReadChapterId && (
        <Link
          scroll={false}
          href={`/chapter/${lastReadChapterId}`}
          className={cn(
            buttonVariants(),
            'font-medium transition-colors text-primary-read-btn-foreground bg-primary-read-btn hover:bg-primary-read-btn/90'
          )}
        >
          Đọc tiếp
        </Link>
      )}
      {!!firstChapter && (
        <Link
          scroll={false}
          href={`/chapter/${firstChapter.id}`}
          className={cn(
            buttonVariants(),
            'font-medium transition-colors text-primary-read-btn-foreground bg-primary-read-btn hover:bg-primary-read-btn/90'
          )}
        >
          Đọc từ đầu
        </Link>
      )}

      {!!session && <MangaFollow hasFollow={!!hasFollow} mangaId={manga.id} />}

      <ShareButton url={`/manga/${manga.slug}`} title={manga.name} />

      {manga.creatorId === session?.user.id && (
        <>
          <a
            target="_blank"
            href={`${meDomain}/mangas/${manga.id}`}
            className={buttonVariants({ variant: 'secondary' })}
            aria-label="edit"
          >
            <Settings className="w-5 h-5" />
          </a>
          <a
            target="_blank"
            href={`${meDomain}/chapters/${manga.id}/upload`}
            className={buttonVariants({ variant: 'secondary' })}
            aria-label="add chapter"
          >
            <Upload className="w-5 h-5" />
          </a>
        </>
      )}
    </div>
  );
};

export default MangaControll;
