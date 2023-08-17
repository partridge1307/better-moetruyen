import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

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
          id: +context.params.id,
          authorId: session.user.id,
        },
        select: {
          id: true,
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
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
