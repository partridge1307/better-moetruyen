/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXTAUTH_URL || 'https://beta.moetruyen.net',
  generateRobotsTxt: true,
  sitemapSize: 7000,
};
