import { db } from '@/lib/db';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    const query = url.searchParams.get('query');
    if (!query) return new Response('Invalid', { status: 400 });
    const queryStr = query.trim().split(' ');

    const existConversation = await db.user
      .findUnique({
        where: {
          id: token.id,
        },
      })
      .conversation({
        select: {
          users: {
            select: {
              id: true,
            },
          },
        },
      });

    const users = await db.user.findMany({
      where: {
        OR: queryStr.map((q) => ({
          name: { contains: q, mode: 'insensitive' },
        })),
        NOT: {
          name: token.name,
        },
        id: {
          notIn: existConversation?.flatMap((con) =>
            con.users.map((u) => u.id)
          ),
        },
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
      take: 10,
    });

    return new Response(JSON.stringify(users));
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}