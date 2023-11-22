import { db } from '@/lib/db';
import { getServerSideSitemap } from 'next-sitemap';

export async function GET(req: Request, context: { params: { page: string } }) {
  const mangas = await db.manga.findMany({
    orderBy: {
      createdAt: 'asc',
    },
    where: {
      isPublished: true,
    },
    take: 7000,
    skip: parseInt(context.params.page) * 7000,
    select: {
      slug: true,
    },
  });

  const siteMap = await (
    await getServerSideSitemap(
      mangas.map((manga) => ({
        loc: `${process.env.NEXTAUTH_URL}/manga/${manga.slug}`,
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
