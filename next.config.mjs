import withPlaiceholder from '@plaiceholder/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.moetruyen.net'],
  },
  async rewrites() {
    return [
      {
        source: '/m',
        destination: 'https://m.moetruyen.net',
      },
    ];
  },
};

export default withPlaiceholder(nextConfig);
