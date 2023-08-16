import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';
import { z } from 'zod';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id } = z.object({ id: z.string() }).parse(await req.json());

    const [user, target] = await db.$transaction([
      db.user.findFirstOrThrow({
        where: { id: session.user.id, role: 'ADMIN' },
        select: { name: true },
      }),
      db.user.findFirst({
        where: { id, isBanned: false },
        select: { id: true, name: true },
      }),
    ]);

    if (target) {
      await db.$transaction([
        db.user.update({
          where: { id: target.id },
          data: {
            isBanned: true,
            session: { deleteMany: {} },
          },
        }),
        db.log.create({
          data: { content: `${user.name} đã ban user ${target.name}` },
        }),
      ]);
    } else {
      return new Response('User already banned', { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
