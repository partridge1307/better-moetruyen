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

    const user = await db.user.findFirst({
      where: {
        id: token.id,
      },
    });
    if (!user) return new Response('User does not exists', { status: 404 });

    const targetChapter = await db.chapter.findFirst({
      where: {
        id: parseInt(context.params.chapterId, 10),
        manga: {
          creatorId: user.id,
        },
      },
    });
    if (!targetChapter) return new Response('Not found', { status: 404 });

    await db.chapter.update({
      where: {
        id: targetChapter.id,
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
