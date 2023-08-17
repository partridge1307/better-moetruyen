import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { ChatValidator } from '@/lib/validators/chat';
import { Prisma } from '@prisma/client';
import { ZodError, z } from 'zod';

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

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

    const messages = await db.message.findMany({
      where: {
        conversationId: parseInt(id),
        conversation: {
          users: {
            some: {
              id: session.user.id,
            },
          },
        },
      },
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
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return new Response(JSON.stringify(messages));
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

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { conversationId, content } = ChatValidator.parse(await req.json());

    if (conversationId <= 0) return new Response('Invalid', { status: 400 });

    await db.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content,
      },
    });

    return new Response('OK');
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
