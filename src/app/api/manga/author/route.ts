import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const authorQuery = new URL(req.url).searchParams.get('q');
    if (!authorQuery) return new Response('Invalid URL', { status: 422 });

    const author = await db.mangaAuthor.findMany({
      where: {
        name: {
          contains: authorQuery,
          mode: 'insensitive',
        },
      },
      take: 5,
    });

    return new Response(JSON.stringify({ author: [...author] }), {
      status: 200,
    });
  } catch (error) {
    return new Response('Không thể tìm tên tác giả', { status: 500 });
  }
}
