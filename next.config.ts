import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  transpilePackages: ['three'],

  
  // 👇 ADD THIS SECTION 👇
  async rewrites() {
    return [
      {
        source: '/academy',
        destination: 'https://knowledgegroove-academy.vercel.app/academy',
      },
      {
        source: '/academy/:path*',
        destination: 'https://knowledgegroove-academy.vercel.app/academy/:path*',
      },
    ];
  },
  // 👆 END OF NEW SECTION 👆
  
};

export default nextConfig;
