import { db } from '@/lib/db';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function PATCH(
  req: NextRequest,
  context: { params: { chapterId: string } }
) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    const targetChapter = await db.chapter.findFirst({
      where: {
        id: parseInt(context.params.chapterId, 10),
      },
      include: {
        manga: true,
      },
    });
    if (!targetChapter) return new Response('Not found', { status: 404 });
    if (targetChapter.manga.creatorId !== token.id)
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
