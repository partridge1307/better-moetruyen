import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id, type } = z
      .object({ id: z.string(), type: z.enum(['ACCEPT', 'REJECT']) })
      .parse(await req.json());

    const [user, target] = await db.$transaction([
      db.user.findFirstOrThrow({
        where: {
          id: session.user.id,
          OR: [{ role: 'ADMIN' }, { role: 'MOD' }],
        },
        select: {
          role: true,
          name: true,
        },
      }),
      db.verifyList.findFirstOrThrow({
        where: {
          userId: id,
        },
      }),
    ]);

    if (type === 'ACCEPT') {
      await db.$transaction([
        db.user.update({
          where: {
            id: target.userId,
          },
          data: {
            verified: true,
          },
        }),
        db.verifyList.delete({
          where: {
            userId: target.userId,
          },
        }),
        db.log.create({
          data: {
            content: `${user.name} (${user.role}) đã Verify userId: ${target.userId}`,
          },
        }),
      ]);
    } else {
      await db.$transaction([
        db.verifyList.delete({
          where: {
            userId: target.userId,
          },
        }),
        db.log.create({
          data: {
            content: `${user.name} (${user.role}) đã từ chối Verify userId: ${target.userId}`,
          },
        }),
      ]);
    }

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}