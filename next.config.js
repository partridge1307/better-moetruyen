const url = new URL(process.env.NEXTAUTH_URL ?? 'https://moetruyen.net');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.moetruyen.net',
        port: '',
        pathname: '/*/**',
      },
    ],
  },
  rewrites: async () => [
    {
      source: '/manga-sitemap.xml',
      destination: '/manga-sitemap',
    },
    {
      source: '/manga-sitemap-:page.xml',
      destination: '/manga-sitemap/:page',
    },
    {
      source: '/chapter-sitemap.xml',
      destination: '/chapter-sitemap',
    },
    {
      source: '/chapter-sitemap-:page.xml',
      destination: '/chapter-sitemap/:page',
    },
    {
      source: '/user-sitemap.xml',
      destination: '/user-sitemap',
    },
    {
      source: '/user-sitemap-:page.xml',
      destination: '/user-sitemap/:page',
    },
  ],
  experimental: {
    webpackBuildWorker: true,
    serverActions: {
      allowedOrigins: ['localhost:3000', url.hostname],
    },
  },
};

module.exports = nextConfig;
