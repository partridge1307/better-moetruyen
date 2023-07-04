import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(
  req: Request,
  context: { params: { chapterId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const targetChapter = await db.chapter.findFirst({
      where: {
        id: parseInt(context.params.chapterId, 10),
      },
      include: {
        manga: true,
      },
    });
    if (!targetChapter) return new Response('Not found', { status: 404 });
    if (targetChapter.manga.creatorId !== session.user.id)
      return new Response('Forbidden', { status: 403 });

    await db.chapter.update({
      where: {
        id: parseInt(context.params.chapterId, 10),
      },
      data: {
        isPublished: true,
      },
    });

    return new Response('OK');
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
