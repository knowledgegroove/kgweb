import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (local dev database for the AL portal) ships WASM files and must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Dev only: lets local multi-account testing use 127.0.0.1 and *.localhost alongside localhost.
  allowedDevOrigins: ["127.0.0.1", "*.localhost"],
  // TEMPORARY (AL portal pilot demo): send the homepage to the portal. 307, not cached by browsers or
  // search engines. Remove this to restore the normal homepage.
  async redirects() {
    return [{ source: "/", destination: "/ALportal", permanent: false }];
  },
};

export default nextConfig;
