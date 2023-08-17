import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const NotifyValidator = z.object({
  limit: z.string(),
  page: z.string(),
});

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const url = new URL(req.url);
    const { limit, page } = NotifyValidator.parse({
      limit: url.searchParams.get('limit'),
      page: url.searchParams.get('page'),
    });

    const notify = await db.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
      select: {
        notifications: {
          take: parseInt(limit),
          skip: (parseInt(page) - 1) * parseInt(limit),
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            fromUser: {
              select: {
                name: true,
              },
            },
            id: true,
            type: true,
            createdAt: true,
            content: true,
            isRead: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(notify.notifications));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
