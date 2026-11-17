import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (local dev database for the AL portal) ships WASM files and must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Dev only: lets local multi-account testing use 127.0.0.1 and *.localhost alongside localhost.
  allowedDevOrigins: ["127.0.0.1", "*.localhost"],
};

export default nextConfig;
