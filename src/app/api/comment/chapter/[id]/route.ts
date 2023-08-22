import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const url = new URL(req.url);

    const { page, limit } = z
      .object({
        page: z.string(),
        limit: z.string(),
      })
      .parse({
        page: url.searchParams.get('page'),
        limit: url.searchParams.get('limit'),
      });

    const [, comments] = await db.$transaction([
      db.chapter.findFirstOrThrow({
        where: {
          id: +context.params.id,
        },
        select: {
          id: true,
        },
      }),
      db.comment.findMany({
        where: {
          chapterId: +context.params.id,
          replyToId: null,
        },
        select: {
          id: true,
          content: true,
          oEmbed: true,
          createdAt: true,
          votes: true,
          authorId: true,
          author: {
            select: {
              name: true,
              color: true,
              image: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return new Response(JSON.stringify(comments));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
