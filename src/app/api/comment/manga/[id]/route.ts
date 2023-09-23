import { db } from '@/lib/db';
import { z } from 'zod';

const CommentValidator = z.object({
  limit: z.string(),
  cursor: z.string().nullish().optional(),
});

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const url = new URL(req.url);

    const { cursor: userCursor, limit } = CommentValidator.parse({
      limit: url.searchParams.get('limit'),
      cursor: url.searchParams.get('cursor'),
    });

    const cursor = userCursor ? parseInt(userCursor) : undefined;

    let comments;
    if (cursor) {
      comments = await db.comment.findMany({
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
          chapter: {
            select: {
              id: true,
              chapterIndex: true,
            },
          },
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
        skip: 1,
        cursor: {
          id: cursor,
        },
      });
    } else {
      comments = await db.comment.findMany({
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
          chapter: {
            select: {
              id: true,
              chapterIndex: true,
            },
          },
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
      });
    }

    return new Response(
      JSON.stringify({
        comments,
        lastCursor:
          comments.length === parseInt(limit)
            ? comments[comments.length - 1].id
            : undefined,
      })
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
