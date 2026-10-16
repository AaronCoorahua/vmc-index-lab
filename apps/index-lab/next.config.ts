import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@vmc/concorde-adapter"],
};

export default nextConfig;
