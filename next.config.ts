import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security: Disable x-powered-by header
  poweredByHeader: false,
  
  // Security: Configure allowed image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
    ],
  },
  
  // Security: Strict mode for React
  reactStrictMode: true,
  
  // Security headers are handled in middleware.ts for more control
};

export default nextConfig;
