import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const CommentValidator = z.object({
  limit: z.string(),
  cursor: z.string().nullish().optional(),
});

const getComments = ({
  cursor,
  limit,
  chapterId,
}: {
  cursor?: number;
  limit: number;
  chapterId: number;
}) => {
  let paginationProps: Prisma.CommentFindManyArgs = {};
  if (cursor) {
    paginationProps.skip = 1;
    paginationProps.cursor = {
      id: cursor,
    };
  }

  return db.comment.findMany({
    where: {
      chapterId,
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
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    ...paginationProps,
  });
};

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const url = new URL(req.url);

    const { limit, cursor: userCursor } = CommentValidator.parse({
      limit: url.searchParams.get('limit'),
      cursor: url.searchParams.get('cursor'),
    });

    const cursor = userCursor ? parseInt(userCursor) : undefined;
    const comments = await getComments({
      cursor,
      limit: parseInt(limit),
      chapterId: +context.params.id,
    });

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
