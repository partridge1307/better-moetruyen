import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function PATCH(
  req: Request,
  context: { params: { chapterId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const targetChapter = await db.chapter.findFirstOrThrow({
      where: {
        id: +context.params.chapterId,
        manga: {
          creatorId: session.user.id,
        },
      },
      select: {
        id: true,
        mangaId: true,
      },
    });

    await db.$transaction([
      db.manga.findFirstOrThrow({
        where: {
          id: targetChapter.mangaId,
          isPublished: true,
        },
        select: {
          isPublished: true,
        },
      }),
      db.chapter.update({
        where: {
          id: targetChapter.id,
        },
        data: {
          isPublished: true,
        },
      }),
    ]);

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
