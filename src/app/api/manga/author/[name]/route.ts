import { db } from '@/lib/db';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: { name: string } }
) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    const author = await db.mangaAuthor.findMany({
      where: {
        name: {
          contains: context.params.name,
          mode: 'insensitive',
        },
      },
    });

    return new Response(JSON.stringify({ author: [...author] }), {
      status: 200,
    });
  } catch (error) {
    return new Response('Không thể tìm tên tác giả', { status: 500 });
  }
}
