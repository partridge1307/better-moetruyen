import { db } from '@/lib/db';
import { getServerSideSitemap } from 'next-sitemap';

export async function GET(req: Request, context: { params: { page: string } }) {
  const chapters = await db.chapter.findMany({
    orderBy: {
      createdAt: 'asc',
    },
    where: {
      isPublished: true,
    },
    take: 7000,
    skip: parseInt(context.params.page) * 7000,
    select: {
      id: true,
    },
  });

  const siteMap = await (
    await getServerSideSitemap(
      chapters.map((chapter) => ({
        loc: `${process.env.NEXTAUTH_URL}/chapter/${chapter.id}`,
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
