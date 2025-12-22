import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  transpilePackages: ['three'],


  /* 👇 COMMENTED OUT TO USE LOCAL FOLDER 👇
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
  👆 END OF COMMENTED SECTION 👆 */

};

export default nextConfig;
