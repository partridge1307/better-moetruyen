import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { MuteValidator } from '@/lib/validators/admin';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';
import { ZodError } from 'zod';

export async function PATCH(req: NextRequest) {
  try {
    const { id, expiredAt } = MuteValidator.parse(await req.json());
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const [user, target] = await db.$transaction([
      db.user.findFirstOrThrow({
        where: {
          id: session.user.id,
          OR: [{ role: 'ADMIN' }, { role: 'MOD' }],
        },
        select: {
          name: true,
        },
      }),
      db.user.findFirst({
        where: { id, muteExpires: null },
        select: { id: true, name: true },
      }),
    ]);

    if (target) {
      await db.$transaction([
        db.user.update({
          where: { id: target.id },
          data: {
            muteExpires: expiredAt,
            session: { deleteMany: {} },
          },
        }),
        db.log.create({
          data: { content: `${user.name} đã Mute ${target.name}` },
        }),
      ]);

      return new Response('OK');
    } else {
      return new Response('User already muted', { status: 400 });
    }
  } catch (error) {
    if (error instanceof ZodError)
      return new Response('Invalid', { status: 422 });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
