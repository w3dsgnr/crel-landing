import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SSG: полный HTML обоих состояний, деплой на любой статик-хост
  output: "export",
};

export default nextConfig;
