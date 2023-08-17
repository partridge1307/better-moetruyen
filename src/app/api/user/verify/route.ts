import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const [user, inQueue] = await db.$transaction([
      db.user.findFirstOrThrow({
        where: {
          id: session.user.id,
        },
        select: {
          id: true,
          verified: true,
        },
      }),
      db.verifyList.findFirst({
        where: {
          userId: session.user.id,
        },
      }),
    ]);

    if (user.verified)
      return new Response('You already verified', { status: 400 });

    if (inQueue)
      return new Response('You already in verify queue', { status: 418 });
    else {
      await db.verifyList.create({
        data: {
          userId: user.id,
        },
      });

      return new Response('OK');
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not Found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
