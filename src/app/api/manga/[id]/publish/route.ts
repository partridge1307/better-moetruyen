import { db } from '@/lib/db';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    const [, targetManga] = await db.$transaction([
      db.user.findFirstOrThrow({
        where: {
          id: token.id,
        },
        select: {
          id: true,
        },
      }),
      db.manga.findFirstOrThrow({
        where: {
          id: +context.params.id,
          creatorId: token.id,
        },
        select: {
          _count: {
            select: {
              chapter: true,
            },
          },
          id: true,
        },
      }),
    ]);
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
            create: { totalView: 0 },
          },
        },
      },
    });

    return new Response('OK');
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
