import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { CreateSubscriptionValidator } from '@/lib/validators/forum';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { type, subForumId } = CreateSubscriptionValidator.parse(
      await req.json()
    );

    if (type === 'SUBSCRIBE') {
      await db.subscription.create({
        data: {
          subForumId,
          userId: session.user.id,
        },
      });
    } else {
      await db.subscription.delete({
        where: {
          userId_subForumId: {
            userId: session.user.id,
            subForumId,
          },
        },
      });
    }

    return new Response('OK');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
