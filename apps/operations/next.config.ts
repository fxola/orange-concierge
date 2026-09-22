import type { NextConfig } from 'next';

const distDir = process.env.NEXT_DIST_DIR;

const nextConfig: NextConfig = {
  ...(distDir ? { distDir } : {}),
  experimental: {
    // Keep lucide-react out of the shared barrel in dev/bundles (Vercel
    // react-best-practices: bundle-barrel-imports). Standard named imports
    // stay — Next rewrites them to direct imports.
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
