import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { ZodError, z } from 'zod';

const chapterValidator = z.object({
  images: z.string().array(),
  chapterName: z.string().min(3).max(255).optional(),
  chapterIndex: z.number().min(0),
  volume: z.number().min(1),
});

export async function PATCH(
  req: NextRequest,
  context: { params: { chapterId: string } }
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

    await db.manga.findFirstOrThrow({
      where: {
        creatorId: user.id,
        chapter: {
          some: {
            id: +context.params.chapterId,
          },
        },
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
    if (!images.length) return new Response('Invalid', { status: 422 });

    await db.chapter.update({
      where: {
        id: +context.params.chapterId,
      },
      data: {
        chapterIndex,
        name,
        volume,
        images,
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(error.message, { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
