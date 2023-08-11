import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    const [user, targetUser] = await db.$transaction([
      db.user.findFirstOrThrow({
        where: {
          id: token.id,
        },
        select: {
          id: true,
        },
      }),
      db.user.findFirstOrThrow({
        where: {
          id: context.params.id,
        },
        select: {
          id: true,
        },
      }),
    ]);

    const existConversation = await db.conversation.findFirst({
      where: {
        AND: [
          {
            users: {
              some: {
                id: user.id,
              },
            },
          },
          {
            users: {
              some: {
                id: targetUser.id,
              },
            },
          },
        ],
      },
    });
    if (existConversation)
      return new Response('Existed conversation', { status: 406 });

    const createdConversation = await db.conversation.create({
      data: {
        users: {
          connect: [{ id: user.id }, { id: targetUser.id }],
        },
      },
    });

    return new Response(JSON.stringify(createdConversation.id));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
