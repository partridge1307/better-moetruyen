import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { db } from '@/lib/db';
import type { User } from '@prisma/client';
import { FC } from 'react';
import MangaInfo from './MangaInfo';

interface MangaProps {
  user: Pick<User, 'id'>;
}

const Manga: FC<MangaProps> = async ({ user }) => {
  const dbUser = await db.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      manga: {
        where: {
          isPublished: true,
        },
        orderBy: {
          view: {
            totalView: 'desc',
          },
        },
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
        select: {
          id: true,
          slug: true,
          image: true,
          name: true,
          review: true,
          createdAt: true,
          chapter: {
            take: 3,
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              volume: true,
              chapterIndex: true,
              name: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });
  if (!dbUser) return;

  return (
    <MangaInfo
      userId={user.id}
      initialData={{
        data: dbUser.manga,
        lastCursor:
          dbUser.manga.length === INFINITE_SCROLL_PAGINATION_RESULTS
            ? dbUser.manga[dbUser.manga.length - 1].id
            : undefined,
      }}
    />
  );
};

export default Manga;
