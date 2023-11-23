import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const getForums = ({
  userId,
  limit,
  cursor,
}: {
  userId: string;
  limit: number;
  cursor?: number;
}) => {
  const paginationProps: Prisma.SubForumFindManyArgs = {};

  if (!!cursor) {
    paginationProps.skip = 1;
    paginationProps.cursor = {
      id: cursor,
    };
  }

  return db.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: {
      subForum: {
        orderBy: {
          subscriptions: {
            _count: 'desc',
          },
        },
        ...paginationProps,
        take: limit,
        select: {
          id: true,
          slug: true,
          banner: true,
          title: true,
          _count: {
            select: {
              subscriptions: true,
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

    const user = await getForums({
      userId: context.params.id,
      limit: parseInt(limit),
      cursor,
    });

    return new Response(
      JSON.stringify({
        data: user.subForum,
        lastCursor:
          user.subForum.length === parseInt(limit)
            ? user.subForum[user.subForum.length - 1].id
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
