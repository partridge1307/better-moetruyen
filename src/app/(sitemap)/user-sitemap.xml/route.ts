import { db } from '@/lib/db';
import { ISitemapField, getServerSideSitemap } from 'next-sitemap';

export async function GET(req: Request) {
  const users = await db.user.findMany({
    where: {
      verified: true,
    },
    select: {
      name: true,
    },
  });

  const fields: ISitemapField[] = users.map((user) => ({
    loc: `${process.env.NEXTAUTH_URL}/user/${user.name?.split(' ').join('-')}`,
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
