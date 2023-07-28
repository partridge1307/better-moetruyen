import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const NotifyValidator = z.object({
  limit: z.string(),
  page: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    const user = await db.user.findFirstOrThrow({
      where: {
        id: token.id,
      },
      select: {
        id: true,
      },
    });

    const url = new URL(req.url);

    const { limit, page } = NotifyValidator.parse({
      limit: url.searchParams.get('limit'),
      page: url.searchParams.get('page'),
    });

    const notify = await db.user.findUniqueOrThrow({
      where: {
        id: user.id,
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
            type: true,
            createdAt: true,
            content: true,
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
