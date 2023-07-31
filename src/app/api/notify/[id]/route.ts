import { db } from '@/lib/db';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    const notify = await db.notify.findFirstOrThrow({
      where: {
        id: +context.params.id,
      },
      select: {
        id: true,
        isRead: true,
      },
    });

    if (notify.isRead) return new Response('Invalid', { status: 422 });

    await db.notify.update({
      where: {
        id: notify.id,
      },
      data: {
        isRead: true,
      },
    });

    return new Response('OK');
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
