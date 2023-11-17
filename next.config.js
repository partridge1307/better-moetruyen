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
    ],
  },
  experimental: {
    webpackBuildWorker: true,
    serverActions: {
      allowedOrigins: ['localhost:3000', url.hostname],
    },
  },
};

module.exports = withPWA(nextConfig);
