import { db } from '@/lib/db';
import { userFollowValidator } from '@/lib/validators/vote';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    const user = await db.user.findFirstOrThrow({
      where: {
        id: token.id,
      },
      select: {
        id: true,
      },
    });

    const { id, target } = userFollowValidator.parse(await req.json());

    if (target === 'MANGA') {
      const existingFollow = await db.mangaFollow.findFirst({
        where: {
          userId: user.id,
          mangaId: +id,
        },
      });

      if (existingFollow) {
        await db.mangaFollow.delete({
          where: {
            mangaId_userId: {
              mangaId: existingFollow.mangaId,
              userId: user.id,
            },
          },
        });
      } else {
        await db.mangaFollow.create({
          data: {
            mangaId: +id,
            userId: user.id,
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
