import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { CommentContentValidator } from '@/lib/validators/comment';
import { Prisma } from '@prisma/client';
import { ZodError, z } from 'zod';

const CommentQuery = z.object({
  limit: z.string(),
  page: z.string(),
  chapterId: z.string(),
});

export async function GET(
  req: Request,
  context: { params: { chapterId: string } }
) {
  const url = new URL(req.url);

  try {
    const { limit, page, chapterId } = CommentQuery.parse({
      limit: url.searchParams.get('limit'),
      page: url.searchParams.get('page'),
      chapterId: context.params.chapterId,
    });

    const comments = await db.comment.findMany({
      where: {
        replyToId: null,
        chapterId: parseInt(chapterId),
      },
      select: {
        id: true,
        content: true,
        oEmbed: true,
        createdAt: true,
        authorId: true,
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

export async function POST(
  req: Request,
  context: { params: { chapterId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { content, oEmbed, commentId, id } = CommentContentValidator.parse(
      await req.json()
    );

    if (commentId) {
      await db.comment.create({
        data: {
          content: { ...content },
          oEmbed,
          authorId: session.user.id,
          mangaId: +id!,
          chapterId: +context.params.chapterId,
          replyToId: commentId,
        },
      });
    } else {
      await db.comment.create({
        data: {
          content: { ...content },
          oEmbed,
          authorId: session.user.id,
          mangaId: +id!,
          chapterId: +context.params.chapterId,
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
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
