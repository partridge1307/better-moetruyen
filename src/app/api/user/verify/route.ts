import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    const [user, inQueue] = await db.$transaction([
      db.user.findFirstOrThrow({
        where: {
          id: token.id,
        },
        select: {
          id: true,
          verified: true,
        },
      }),
      db.verifyList.findFirst({
        where: {
          userId: token.id,
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
