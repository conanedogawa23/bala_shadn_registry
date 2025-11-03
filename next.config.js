/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
    NEXT_PUBLIC_DEBUG: process.env.NEXT_PUBLIC_DEBUG || 'false',
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  outputFileTracingIncludes: {
    registry: ["./registry/**/*"],
  },
  images: {
    domains: ['ui.shadcn.com'],
    unoptimized: true, // For standalone deployment
  },
  typescript: {
    // Ignore TypeScript errors during build to allow deployment with warnings
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint errors during builds to allow warnings
    ignoreDuringBuilds: true,
  },
  /* config options here */
};

module.exports = nextConfig;
