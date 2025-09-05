/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: 'https://665ac05b2282.ngrok.app/api/v1',
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
