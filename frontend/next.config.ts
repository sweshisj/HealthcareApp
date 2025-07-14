import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // <--- Add this line for standalone output

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // Example: allow images from placeholder.com
        port: '',
        pathname: '/**',
      },
    ],
  }
};

export default nextConfig;
