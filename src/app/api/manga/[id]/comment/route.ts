import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { CommentContentValidator } from '@/lib/validators/comment';
import { Prisma } from '@prisma/client';
import { ZodError, z } from 'zod';

const CommentQuery = z.object({
  mangaId: z.string(),
  limit: z.string(),
  page: z.string(),
});

export async function GET(req: Request, context: { params: { id: string } }) {
  const url = new URL(req.url);

  try {
    const { limit, page, mangaId } = CommentQuery.parse({
      limit: url.searchParams.get('limit'),
      page: url.searchParams.get('page'),
      mangaId: context.params.id,
    });

    const comments = await db.comment.findMany({
      where: {
        mangaId: parseInt(mangaId),
        replyToId: null,
      },
      select: {
        id: true,
        content: true,
        oEmbed: true,
        createdAt: true,
        authorId: true,
        chapter: {
          select: {
            id: true,
            chapterIndex: true,
          },
        },
        author: {
          select: {
            name: true,
            image: true,
            color: true,
          },
        },
        votes: true,
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    });

    return new Response(JSON.stringify(comments));
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { content, oEmbed, commentId } = CommentContentValidator.parse(
      await req.json()
    );

    if (commentId) {
      await db.comment.create({
        data: {
          content: { ...content },
          oEmbed,
          authorId: session.user.id,
          mangaId: +context.params.id,
          replyToId: commentId,
        },
      });
    } else {
      await db.comment.create({
        data: {
          content: { ...content },
          oEmbed,
          authorId: session.user.id,
          mangaId: +context.params.id,
        },
      });
    }

    return new Response('OK');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not Found', { status: 404 });
      }
    }
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
