import { socketServer } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  context: { params: { channelId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized');

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        account: true,
      },
    });
    if (!user?.account.length)
      return new Response('Not found', { status: 404 });

    const res = await fetch(
      `${socketServer}/api/v1/server/${context.params.channelId}/${user.account[0].providerAccountId}`
    );
    if (!res.ok) return new Response('Not found', { status: 404 });

    return new Response(JSON.stringify((await res.json()).channels));
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
