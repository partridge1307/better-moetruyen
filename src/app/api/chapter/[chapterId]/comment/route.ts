import { db } from '@/lib/db';
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
