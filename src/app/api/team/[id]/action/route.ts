import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { type } = z
      .object({
        type: z.enum(['JOIN', 'LEAVE']),
      })
      .parse(await req.json());

    const [user, team] = await db.$transaction([
      db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
        },
        select: {
          teamId: true,
        },
      }),
      db.team.findUniqueOrThrow({
        where: {
          id: +context.params.id,
        },
        select: {
          id: true,
          ownerId: true,
        },
      }),
    ]);

    if (type === 'JOIN') {
      if (user.teamId === team.id)
        return new Response('Forbidden', { status: 403 });
      if (!!user.teamId) return new Response('Forbidden', { status: 403 });

      await db.$transaction([
        db.teamJoinRequest.create({
          data: {
            teamId: team.id,
            userId: session.user.id,
          },
        }),
        db.notify.create({
          data: {
            toUserId: team.ownerId,
            type: 'SYSTEM',
            content: `${session.user.name} muốn xin gia nhập Team của bạn`,
            endPoint: `${process.env.NEXT_PUBLIC_ME_URL}/team`,
          },
        }),
      ]);

      return new Response('OK', { status: 201 });
    } else {
      if (user.teamId !== team.id)
        return new Response('Forbidden', { status: 409 });

      await db.team.update({
        where: {
          id: team.id,
        },
        data: {
          member: {
            disconnect: {
              id: session.user.id,
            },
          },
        },
      });
      return new Response('OK');
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
      if (error.code === 'P2002')
        return new Response('Not accept', { status: 406 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
