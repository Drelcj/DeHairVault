/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Re-enabled this in case you need it, 
    // but feel free to set to false for better code safety
    ignoreBuildErrors: true, 
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;