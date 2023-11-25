import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const getMangas = ({
  id,
  limit,
  cursor,
}: {
  id: string;
  limit: number;
  cursor?: number;
}) => {
  const paginationProps: Prisma.MangaFindManyArgs = {};

  if (!!cursor) {
    paginationProps.skip = 1;
    paginationProps.cursor = {
      id: cursor,
    };
  }

  return db.user.findUniqueOrThrow({
    where: {
      id,
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
        take: limit,
        ...paginationProps,
        select: {
          id: true,
          slug: true,
          image: true,
          name: true,
          review: true,
          createdAt: true,
          chapter: {
            where: {
              isPublished: true,
            },
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
    const { limit, cursor: userCursor } = z
      .object({
        limit: z.string(),
        cursor: z.string().optional().nullish(),
      })
      .parse({
        limit: url.searchParams.get('limit'),
        cursor: url.searchParams.get('cursor'),
      });

    const cursor = userCursor ? parseInt(userCursor) : undefined;

    const user = await getMangas({
      id: context.params.id,
      limit: parseInt(limit),
      cursor,
    });

    return new Response(
      JSON.stringify({
        data: user.manga,
        lastCursor:
          user.manga.length === parseInt(limit)
            ? user.manga[user.manga.length - 1].id
            : undefined,
      })
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
