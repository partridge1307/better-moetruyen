import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const existingHistory = await db.history.findFirst({
      where: {
        userId: session.user.id,
        mangaId: parseInt(context.params.id),
      },
    });

    if (existingHistory) {
      await db.history.update({
        where: {
          userId_mangaId: {
            userId: session.user.id,
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
          userId: session.user.id,
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
