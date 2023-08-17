import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const [targetUser, existConversation] = await db.$transaction([
      db.user.findFirstOrThrow({
        where: {
          id: context.params.id,
        },
        select: {
          id: true,
        },
      }),
      db.conversation.findFirst({
        where: {
          AND: [
            {
              users: {
                some: {
                  id: session.user.id,
                },
              },
            },
            {
              users: {
                some: {
                  id: context.params.id,
                },
              },
            },
          ],
        },
      }),
    ]);
    if (existConversation)
      return new Response('Existed conversation', { status: 406 });

    const createdConversation = await db.conversation.create({
      data: {
        users: {
          connect: [{ id: session.user.id }, { id: targetUser.id }],
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
