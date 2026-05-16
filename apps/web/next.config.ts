import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@deskcrew/ui", "@deskcrew/types", "@deskcrew/protocol"],
};

export default config;
