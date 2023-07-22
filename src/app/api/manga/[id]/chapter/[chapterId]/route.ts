import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function POST(
  req: Request,
  context: { params: { id: string; chapterId: string } }
) {
  try {
    const chapter = await db.chapter.findFirstOrThrow({
      where: {
        id: +context.params.chapterId,
        mangaId: +context.params.id,
      },
      select: {
        id: true,
        mangaId: true,
      },
    });

    await db.view.update({
      where: {
        mangaId: chapter.mangaId,
      },
      data: {
        totalView: {
          increment: 1,
        },
        dailyView: {
          create: { chapterId: chapter.id },
        },
        weeklyView: {
          create: { chapterId: chapter.id },
        },
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
