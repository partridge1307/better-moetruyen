import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function GET(req: Request) {
  try {
    const queryName = new URL(req.url).searchParams.get('q');
    if (!queryName) throw Error();

    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const [, target] = await db.$transaction([
      db.user.findFirstOrThrow({
        where: {
          id: session.user.id,
          OR: [{ role: 'ADMIN' }, { role: 'MOD' }],
        },
      }),
      db.user.findMany({
        where: {
          name: { contains: queryName, mode: 'insensitive' },
          NOT: { OR: [{ role: 'ADMIN' }, { role: 'MOD' }] },
        },
        select: { id: true, name: true, isBanned: true, muteExpires: true },
      }),
    ]);

    return new Response(JSON.stringify(target));
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
