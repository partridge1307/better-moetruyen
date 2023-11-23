const url = new URL(process.env.NEXTAUTH_URL ?? 'https://moetruyen.net');

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: true,
});

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
      {
        protocol: 'https',
        hostname: 'sin1.contabostorage.com',
        port: '',
        pathname: '/*/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
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

module.exports = withPWA(nextConfig);
