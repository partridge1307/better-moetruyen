import { getAuthSession } from '@/lib/auth';
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

    const comments = await db.comment.findMany({
      where: {
        mangaId: +context.params.id,
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
    });

    return new Response(JSON.stringify(comments));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    await db.$transaction([
      db.comment.findFirstOrThrow({
        where: {
          authorId: session.user.id,
          id: +context.params.id,
        },
      }),
      db.comment.delete({
        where: {
          id: +context.params.id,
        },
      }),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
