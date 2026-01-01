/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Ignore "Linting" errors (Code style checks)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 2. Ignore "Type" errors (Strict variable checks)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
