import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id, type } = z
      .object({
        id: z.number(),
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
          id,
          NOT: {
            ownerId: session.user.id,
          },
        },
        select: {
          id: true,
          ownerId: true,
        },
      }),
    ]);

    if (user.teamId && user.teamId !== team.id)
      return new Response('Not found', { status: 404 });

    if (type === 'JOIN') {
      if (user.teamId)
        return new Response('You already joined team', { status: 406 });

      await db.$transaction([
        db.teamJoinRequest.create({
          data: {
            teamId: team.id,
            userId: session.user.id,
          },
        }),
        db.notify.create({
          data: {
            type: 'GENERAL',
            toUserId: team.ownerId,
            content: `${session.user.name} muốn gia nhập Team của bạn`,
            endPoint: `${process.env.NEXT_PUBLIC_ME_URL}/team`,
          },
        }),
      ]);

      return new Response('OK', { status: 201 });
    } else {
      await db.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          team: {
            disconnect: {
              id: team.id,
            },
          },
        },
      });

      return new Response('OK', { status: 204 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
      if (error.code === 'P2002')
        return new Response('You already sent join request', { status: 409 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
