import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import type { Manga } from '@prisma/client';
import type { Session } from 'next-auth';
import { FC } from 'react';
import MangaFollow from './MangaFollow';
import { Settings, Upload } from 'lucide-react';
import Link from 'next/link';
import ShareButton from '@/components/ShareButton';

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
    const follow = await db.mangaFollow.findUnique({
      where: {
        mangaId_userId: {
          mangaId,
          userId: session.user.id,
        },
      },
    });

    return follow ?? null;
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

  const lastReadChapterId = await history(session, manga.id);
  const follow = await getFollow(session, manga.id);

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

      {!!session && <MangaFollow follow={follow} mangaId={manga.id} />}

      <ShareButton url={`/manga/${manga.slug}`} title={manga.name} />

      {manga.creatorId === session?.user.id && (
        <>
          <a
            target="_blank"
            href={`/me/manga/${manga.id}`}
            className={buttonVariants({ variant: 'secondary' })}
            aria-label="edit"
          >
            <Settings className="w-5 h-5" />
          </a>
          <a
            target="_blank"
            href={`/me/manga/${manga.id}/chapter/upload`}
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
