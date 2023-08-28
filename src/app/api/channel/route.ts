import { socketServer } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { ZodError, z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { channel, role } = z
      .object({
        channel: z.object({
          id: z.string(),
          name: z.string(),
        }),
        role: z
          .object({
            id: z.string(),
            name: z.string(),
          })
          .optional(),
      })
      .parse(await req.json());

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        account: true,
        discordChannel: true,
      },
    });
    if (!user?.account.length)
      return new Response('Not found', { status: 404 });

    const res = await fetch(
      `${socketServer}/api/v1/server/${channel.id}/${user.account[0].providerAccountId}`,
      {
        method: 'POST',
      }
    );
    if (!res.ok) {
      if (res.status === 404) return new Response('Not found', { status: 404 });
      if (res.status === 422)
        return new Response('Not acceptable', { status: 406 });
      return new Response('Something went wrong', { status: 500 });
    }

    if (user.discordChannel) {
      await db.$transaction([
        db.discordChannel.deleteMany({
          where: {
            userId: session.user.id,
          },
        }),
        db.discordChannel.create({
          data: {
            userId: session.user.id,
            channelId: channel.id,
            channelName: channel.name,
            roleId: role?.id,
            roleName: role?.name,
          },
        }),
      ]);
    } else {
      await db.discordChannel.create({
        data: {
          userId: session.user.id,
          channelId: channel.id,
          channelName: channel.name,
          roleId: role?.id,
          roleName: role?.name,
        },
      });
    }

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 404 });

    await db.discordChannel.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return new Response('OK');
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
