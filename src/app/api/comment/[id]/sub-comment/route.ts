import { db } from '@/lib/db';

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const subComment = await db.comment.findMany({
      where: {
        replyToId: +context.params.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        author: {
          select: {
            name: true,
            color: true,
            image: true,
          },
        },
        votes: true,
      },
    });

    return new Response(JSON.stringify(subComment));
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
