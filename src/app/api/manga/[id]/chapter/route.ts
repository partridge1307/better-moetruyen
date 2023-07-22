import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const chapterValidator = z.object({
  images: z.string().array(),
  chapterName: z.string().min(3).max(255).optional(),
  chapterIndex: z.number().min(0),
  volume: z.number().min(1),
});

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

    const manga = await db.manga.findFirstOrThrow({
      where: {
        id: +context.params.id,
        creatorId: user.id,
      },
      select: {
        id: true,
      },
    });

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
          select: {
            chapterIndex: true,
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
        select: {
          id: true,
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
    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError)
      return new Response(error.message, { status: 422 });
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
    }
    return new Response('Không thể upload chapter', { status: 500 });
  }
}
