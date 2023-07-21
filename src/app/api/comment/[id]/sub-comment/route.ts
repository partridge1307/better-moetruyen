import { db } from '@/lib/db';

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const subComment = await db.comment.findUnique({
      where: {
        id: +context.params.id,
      },
      select: {
        replies: {
          select: {
            id: true,
            content: true,
            oEmbed: true,
            createdAt: true,
            votes: true,
            author: {
              select: {
                image: true,
                name: true,
                color: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return new Response(JSON.stringify(subComment));
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
