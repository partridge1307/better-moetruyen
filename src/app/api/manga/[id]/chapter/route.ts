import { db } from '@/lib/db';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const chapterValidator = z.object({
  images: z.string().array(),
  chapterName: z.string(),
  chapterIndex: z.number(),
  volume: z.number(),
});

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
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

    const manga = await db.manga.findFirst({
      where: {
        id: parseInt(context.params.id, 10),
        creatorId: user.id,
      },
    });
    if (!manga) return new Response('Forbidden', { status: 400 });

    const {
      chapterIndex,
      chapterName: name,
      images,
      volume,
    } = chapterValidator.parse(await req.json());

    let index;
    if (chapterIndex === 0) {
      index = (
        await db.chapter.findFirst({
          where: {
            mangaId: manga.id,
          },
          orderBy: {
            chapterIndex: 'desc',
          },
        })
      )?.chapterIndex;

      if (!index) index = 1;
      else index++;
    } else {
      index = chapterIndex;
    }

    if (
      await db.chapter.findFirst({
        where: {
          mangaId: manga.id,
          chapterIndex: index,
        },
      })
    )
      return new Response('Forbidden', { status: 403 });

    await db.chapter.create({
      data: {
        chapterIndex: index,
        name,
        volume,
        images: [...images],
        manga: {
          connect: { id: manga.id },
        },
      },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError)
      return new Response(error.message, { status: 422 });
    return new Response('Không thể upload chapter', { status: 500 });
  }
}
