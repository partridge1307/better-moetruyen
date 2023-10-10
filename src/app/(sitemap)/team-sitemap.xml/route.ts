import { db } from '@/lib/db';
import { ISitemapField, getServerSideSitemap } from 'next-sitemap';

export async function GET(req: Request) {
  const teams = await db.team.findMany({
    select: {
      id: true,
    },
  });

  const fields: ISitemapField[] = teams.map((team) => ({
    loc: `${process.env.NEXTAUTH_URL}/team/${team.id}`,
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
