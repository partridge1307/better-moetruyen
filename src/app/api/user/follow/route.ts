import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id, type } = z
      .object({
        id: z.string(),
        type: z.enum(['FOLLOW', 'UNFOLLOW']),
      })
      .parse(await req.json());

    const user = await db.user.findUniqueOrThrow({
      where: {
        id,
        NOT: {
          id: session.user.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (type === 'FOLLOW') {
      await db.user.update({
        where: {
          id: user.id,
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
      await db.user.update({
        where: {
          id: user.id,
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
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
