import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const InfoValidator = z.object({
  limit: z.string(),
  cursor: z.string().nullish().optional(),
});

const getMangas = ({
  teamId,
  limit,
  cursor,
}: {
  teamId: number;
  limit: number;
  cursor?: number;
}) => {
  const paginationProps: Prisma.ChapterFindManyArgs = {};

  if (!!cursor) {
    paginationProps.skip = 1;
    paginationProps.cursor = {
      id: cursor,
    };
  }

  return db.chapter.findMany({
    distinct: ['mangaId'],
    take: limit,
    ...paginationProps,
    where: {
      teamId,
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
};

export async function GET(req: Request, context: { params: { id: string } }) {
  const url = new URL(req.url);

  try {
    const { limit, cursor: userCursor } = InfoValidator.parse({
      limit: url.searchParams.get('limit'),
      cursor: url.searchParams.get('cursor'),
    });

    const cursor = !!userCursor ? parseInt(userCursor) : undefined;
    const chapter = await getMangas({
      teamId: +context.params.id,
      limit: parseInt(limit),
      cursor,
    });

    return new Response(
      JSON.stringify({
        data: chapter.map(({ manga }) => manga),
        lastCursor:
          chapter.length === parseInt(limit)
            ? chapter[chapter.length - 1].id
            : undefined,
      })
    );
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
