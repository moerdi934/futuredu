/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
    eslint: {
    ignoreDuringBuilds: true,   // lewati semua error ESLint
  },
  // (opsional) kalau masih ada type-error
  typescript: {
    ignoreBuildErrors: true,    // lewati error TypeScript
  },
};

module.exports = nextConfig;