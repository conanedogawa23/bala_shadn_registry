/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    registry: ["./registry/**/*"],
  },
  images: {
    domains: ['ui.shadcn.com'],
  },
  /* config options here */
};

module.exports = nextConfig;
