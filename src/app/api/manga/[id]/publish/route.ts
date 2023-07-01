import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const targetManga = await db.manga.findFirst({
      where: {
        id: +context.params.id,
      },
      include: {
        _count: {
          select: {
            chapter: true,
          },
        },
      },
    });
    if (!targetManga) return new Response('Not found', { status: 404 });
    if (targetManga.creatorId !== session.user.id)
      return new Response('Forbidden', { status: 400 });
    if (targetManga._count.chapter <= 0)
      return new Response('Must have at least 1 chapter', { status: 403 });

    await db.manga.update({
      where: {
        id: targetManga.id,
      },
      data: {
        isPublished: true,
        view: {
          connectOrCreate: {
            where: { mangaId: targetManga.id },
            create: {
              totalView: 0,
              dailyView: [],
              weeklyView: [],
            },
          },
        },
      },
    });

    return new Response('OK');
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
