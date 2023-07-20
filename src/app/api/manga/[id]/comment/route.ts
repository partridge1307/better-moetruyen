import { db } from '@/lib/db';
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
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
            color: true,
          },
        },
        votes: true,
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
