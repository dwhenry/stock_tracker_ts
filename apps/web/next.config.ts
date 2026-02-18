import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@stock-tracker/database"],
};

export default nextConfig;
