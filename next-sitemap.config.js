const url = process.env.NEXTAUTH_URL || 'https://moetruyen.net';

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: url,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  robotsTxtOptions: {
    additionalSitemaps: [
      `${url}/manga-sitemap.xml`,
      `${url}/chapter-sitemap.xml`,
      `${url}/user-sitemap.xml`,
      `${url}/team-sitemap.xml`,
    ],
  },
};
