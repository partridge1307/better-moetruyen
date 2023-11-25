import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Manga } from '@prisma/client';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import { FC } from 'react';
import ShareButton from '../ShareButton';
import Link from 'next/link';
import { buttonVariants } from '../ui/Button';

const MangaFollow = dynamic(
  () => import('@/components/Manga/components/MangaFollow'),
  {
    ssr: false,
    loading: () => <div className="w-[7.5rem] h-10 rounded-md bg-foreground" />,
  }
);

interface MangaActionProps {
  manga: Pick<Manga, 'id' | 'slug' | 'name'>;
}

const MangaAction: FC<MangaActionProps> = async ({ manga }) => {
  const session = await getAuthSession();
  const [isFollowing, chapterId] = await Promise.all([
    checkFollow(manga.id, session),
    getLastChapterId(manga.id, session),
  ]);

  return (
    <>
      {!!chapterId && (
        <Link
          href={`/chapter/${chapterId}`}
          className={buttonVariants({
            className: 'min-w-[9rem] md:min-w-[11.5rem] lg:min-w-[13.5rem]',
          })}
        >
          Đọc truyện
        </Link>
      )}
      {!!session && (
        <MangaFollow
          mangaId={manga.id}
          isFollow={!!isFollowing}
          hasChapter={!!chapterId}
        />
      )}
      <ShareButton
        url={`/manga/${manga.slug}`}
        title={manga.name}
        className={
          !session && !chapterId
            ? 'min-w-[8.5rem] md:min-w-[11.5rem]  lg:min-w-[13.5rem]'
            : ''
        }
      />
    </>
  );
};

export default MangaAction;

function checkFollow(id: number, session: Session | null) {
  if (!session) return null;

  return db.manga.findUnique({
    where: {
      id,
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
}

async function getLastChapterId(mangaId: number, session: Session | null) {
  const firstChapterPromise = db.chapter
    .findFirst({
      where: {
        mangaId,
      },
      orderBy: {
        chapterIndex: 'asc',
      },
      select: {
        id: true,
      },
    })
    .then((result) => result?.id);
  const historyPromise = !!session
    ? [
        db.history
          .findUnique({
            where: {
              userId_mangaId: {
                userId: session.user.id,
                mangaId,
              },
            },
            select: {
              chapterId: true,
            },
          })
          .then((result) => result?.chapterId),
      ]
    : [];

  const [firstChapterId, historyChapterId] = await Promise.all([
    firstChapterPromise,
    ...historyPromise,
  ]);

  if (!session) return firstChapterId;
  else if (!historyChapterId) return firstChapterId;
  else return historyChapterId;
}
