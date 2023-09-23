import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const subComments = await db.comment.findMany({
      where: {
        replyToId: +context.params.id,
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
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return new Response(JSON.stringify(subComments));
  } catch (error) {
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
      db.comment.findUniqueOrThrow({
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
