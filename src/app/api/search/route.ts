import { db } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);

  try {
    const query = url.searchParams.get('q');
    if (!query) return new Response('Invalid URL', { status: 422 });

    const [mangas, users, forums] = await db.$transaction([
      db.manga.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
          isPublished: true,
        },
        select: {
          id: true,
          slug: true,
          name: true,
          image: true,
          review: true,
          author: {
            select: {
              name: true,
            },
          },
        },
        take: 10,
      }),
      db.user.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        select: {
          name: true,
          image: true,
          color: true,
        },
        take: 10,
      }),
      db.subForum.findMany({
        where: {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        select: {
          slug: true,
          banner: true,
          title: true,
        },
        take: 10,
      }),
    ]);

    return new Response(JSON.stringify({ mangas, users, forums }));
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
