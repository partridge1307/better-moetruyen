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
  },
};

module.exports = withPWA(nextConfig);
