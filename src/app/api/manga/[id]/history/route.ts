import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
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

    const existingHistory = await db.history.findFirst({
      where: {
        userId: user.id,
        mangaId: parseInt(context.params.id),
      },
    });

    if (existingHistory) {
      await db.history.update({
        where: {
          userId_mangaId: {
            userId: user.id,
            mangaId: existingHistory.mangaId,
          },
        },
        data: {
          updatedAt: new Date(Date.now()),
        },
      });
    } else {
      await db.history.create({
        data: {
          mangaId: parseInt(context.params.id),
          userId: user.id,
        },
      });
    }

    return new Response('OK');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
