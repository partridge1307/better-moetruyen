import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { userFollowValidator } from '@/lib/validators/vote';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id, target } = userFollowValidator.parse(await req.json());

    if (target === 'MANGA') {
      const existingFollow = await db.mangaFollow.findUnique({
        where: {
          mangaId_userId: {
            mangaId: +id,
            userId: session.user.id,
          },
        },
      });

      if (existingFollow) {
        await db.mangaFollow.delete({
          where: {
            mangaId_userId: {
              mangaId: existingFollow.mangaId,
              userId: session.user.id,
            },
          },
        });
      } else {
        await db.mangaFollow.create({
          data: {
            mangaId: +id,
            userId: session.user.id,
          },
        });
      }
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
