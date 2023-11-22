import { db } from '@/lib/db';
import { getServerSideSitemapIndex } from 'next-sitemap';

export async function GET(req: Request) {
  const count = await db.chapter.count({
    where: {
      isPublished: true,
    },
  });

  const context = Array.from(Array(Math.ceil(count / 7000)).keys()).map(
    (_, index) => `${process.env.NEXTAUTH_URL}/chapter-sitemap-${index}.xml`
  );

  const siteMap = await (
    await getServerSideSitemapIndex(context, req.headers)
  ).text();

  return new Response(siteMap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=900',
    },
  });
}
