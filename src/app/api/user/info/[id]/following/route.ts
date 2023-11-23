import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const getFOllowByUsers = ({
  userId,
  limit,
  cursor,
}: {
  userId: string;
  limit: number;
  cursor?: string;
}) => {
  const paginationProps: Prisma.UserFindManyArgs = {};

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
      following: {
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        ...paginationProps,
        select: {
          id: true,
          image: true,
          banner: true,
          name: true,
          color: true,
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

    const cursor = userCursor ? userCursor : undefined;

    const user = await getFOllowByUsers({
      userId: context.params.id,
      limit: parseInt(limit),
      cursor,
    });

    return new Response(
      JSON.stringify({
        data: user.following,
        lastCursor:
          user.following.length === parseInt(limit)
            ? user.following[user.following.length - 1].id
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
