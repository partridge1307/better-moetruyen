import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { db } from '@/lib/db';
import type { Team } from '@prisma/client';
import { FC } from 'react';
import MangaInfo from './MangaInfo';

interface MangaProps {
  team: Pick<Team, 'id'>;
}

const Manga: FC<MangaProps> = async ({ team }) => {
  const chapter = await db.chapter.findMany({
    distinct: ['mangaId'],
    take: INFINITE_SCROLL_PAGINATION_RESULTS,
    where: {
      teamId: team.id,
    },
    select: {
      id: true,
      manga: {
        select: {
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

  return (
    <MangaInfo
      teamId={team.id}
      initialContent={{
        data: chapter.map(({ manga }) => manga),
        lastCursor:
          chapter.length === INFINITE_SCROLL_PAGINATION_RESULTS
            ? chapter[chapter.length - 1].id
            : undefined,
      }}
    />
  );
};

export default Manga;
