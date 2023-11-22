import { db } from '@/lib/db';
import { getServerSideSitemap } from 'next-sitemap';

export async function GET(req: Request, context: { params: { page: string } }) {
  const users = await db.user.findMany({
    orderBy: {
      createdAt: 'asc',
    },
    take: 7000,
    skip: parseInt(context.params.page) * 7000,
    select: {
      name: true,
    },
  });

  const siteMap = await (
    await getServerSideSitemap(
      users.map((user) => ({
        loc: `${process.env.NEXTAUTH_URL}/user/${user.name
          ?.split(' ')
          .join('-')}`,
        lastmod: new Date().toISOString(),
        priority: 0.9,
        changefreq: 'daily',
      })),
      req.headers
    )
  ).text();

  return new Response(siteMap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=900',
    },
  });
}
