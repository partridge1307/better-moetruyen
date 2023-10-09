import { db } from '@/lib/db';
import { getServerSideSitemap, type ISitemapField } from 'next-sitemap';

export async function GET(req: Request) {
  const mangas = await db.manga.findMany({
    where: {
      isPublished: true,
    },
    select: {
      slug: true,
      image: true,
    },
  });

  const fields: ISitemapField[] = mangas.map((manga) => ({
    loc: `${process.env.NEXTAUTH_URL}/manga/${manga.slug}`,
    lastmod: new Date().toISOString(),
    priority: 0.7,
    changefreq: 'weekly',
  }));

  const siteMap = await (
    await getServerSideSitemap(fields, req.headers)
  ).text();

  return new Response(siteMap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
