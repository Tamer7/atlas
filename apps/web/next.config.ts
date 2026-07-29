import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Emits .next/standalone with only the traced runtime files, so the
  // production image ships without node_modules.
  output: 'standalone',

  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: '/sanctum/:path*',
        destination: `${apiUrl}/sanctum/:path*`,
      },
    ];
  },
};

export default nextConfig;
