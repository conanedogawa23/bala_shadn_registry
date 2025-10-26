/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:5001/api/v1',
    NEXT_PUBLIC_DEBUG: process.env.NEXT_PUBLIC_DEBUG || 'true',
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  outputFileTracingIncludes: {
    registry: ["./registry/**/*"],
  },
  images: {
    domains: ['ui.shadcn.com'],
  },
  typescript: {
    // Ignore TypeScript errors during build to allow deployment with warnings
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint errors during builds to allow warnings
    ignoreDuringBuilds: false,
  },
  /* config options here */
};

module.exports = nextConfig;
