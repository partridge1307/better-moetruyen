import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { ZodError, z } from 'zod';

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
    const { id, limit, page } = z
      .object({
        id: z.string(),
        limit: z.string(),
        page: z.string(),
      })
      .parse({
        id: url.searchParams.get('id'),
        limit: url.searchParams.get('limit'),
        page: url.searchParams.get('page'),
      });

    const conversation = await db.conversation.findFirstOrThrow({
      where: {
        id: parseInt(id),
        users: {
          some: {
            id: user.id,
          },
        },
      },
      select: {
        messages: {
          select: {
            content: true,
            createdAt: true,
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
                color: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: parseInt(limit),
          skip: (parseInt(page) - 1) * parseInt(limit),
        },
      },
    });

    return new Response(JSON.stringify(conversation.messages));
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(error.message, { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
