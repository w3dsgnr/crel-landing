import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SSG: полный HTML обоих состояний, деплой на любой статик-хост
  output: "export",
  // dev-индикатор Next (тёмный кружок в углу) — не часть языка, гасим
  devIndicators: false,
};

export default nextConfig;
