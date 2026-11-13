import type { NextConfig } from 'next';

const isDevServer =
  process.env.NODE_ENV !== 'production' ||
  process.argv.some((arg) => arg === 'dev');

const nextConfig: NextConfig = {
  output: 'standalone',
  ...(isDevServer ? { distDir: '.next-dev' } : {}),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
