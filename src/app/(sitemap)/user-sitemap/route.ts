import { db } from '@/lib/db';
import { ISitemapField, getServerSideSitemap } from 'next-sitemap';

export async function GET(req: Request) {
  const count = await db.user.count();

  const fields: ISitemapField[] = Array.from(
    Array(Math.ceil(count / 7000)).keys()
  ).map((_, index) => ({
    loc: `${process.env.NEXTAUTH_URL}/user-sitemap-${index}.xml`,
    lastmod: new Date().toISOString(),
    priority: 1,
    changefreq: 'always',
  }));

  const siteMap = await (
    await getServerSideSitemap(fields, req.headers)
  ).text();

  return new Response(siteMap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=900',
    },
  });
}
