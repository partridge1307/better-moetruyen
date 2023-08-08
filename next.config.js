// const withBunleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// });

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp'],
    domains: ['i.moetruyen.net'],
  },
};

module.exports = nextConfig;
