const url = process.env.NEXTAUTH_URL || 'https://beta.moetruyen.net';

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: url,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  robotsTxtOptions: {
    additionalSitemaps: [`${url}/server-sitemap.xml`],
  },
};
