/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/convert-images' : '',
  distDir: 'build',
};

module.exports = nextConfig;
