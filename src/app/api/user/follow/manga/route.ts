import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id, type } = z
      .object({ id: z.number(), type: z.enum(['FOLLOW', 'UNFOLLOW']) })
      .parse(await req.json());

    const manga = await db.manga.findUniqueOrThrow({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (type === 'FOLLOW') {
      await db.manga.update({
        where: {
          id: manga.id,
        },
        data: {
          followedBy: {
            connect: {
              id: session.user.id,
            },
          },
        },
      });
    } else {
      await db.manga.update({
        where: {
          id: manga.id,
        },
        data: {
          followedBy: {
            disconnect: {
              id: session.user.id,
            },
          },
        },
      });
    }

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}

const FollowValidator = z.object({
  limit: z.string(),
  cursor: z.string().nullish().optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);

  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { limit, cursor: userCursor } = FollowValidator.parse({
      limit: url.searchParams.get('limit'),
      cursor: url.searchParams.get('cursor'),
    });

    const cursor = userCursor ? parseInt(userCursor) : undefined;

    let user;
    if (cursor) {
      user = await db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
        },
        select: {
          mangaFollowing: {
            select: {
              id: true,
              slug: true,
              name: true,
              image: true,
              _count: {
                select: {
                  chapter: {
                    where: {
                      isPublished: true,
                    },
                  },
                  followedBy: true,
                },
              },
            },
            take: parseInt(limit),
            skip: 1,
            cursor: {
              id: cursor,
            },
          },
        },
      });
    } else {
      user = await db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
        },
        select: {
          mangaFollowing: {
            select: {
              id: true,
              slug: true,
              name: true,
              image: true,
              _count: {
                select: {
                  chapter: {
                    where: {
                      isPublished: true,
                    },
                  },
                  followedBy: true,
                },
              },
            },
            take: parseInt(limit),
          },
        },
      });
    }

    return new Response(
      JSON.stringify({
        follows: user.mangaFollowing,
        lastCursor:
          user.mangaFollowing.length === parseInt(limit)
            ? user.mangaFollowing[user.mangaFollowing.length - 1].id
            : undefined,
      })
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
