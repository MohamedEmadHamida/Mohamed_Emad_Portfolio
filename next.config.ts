import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Dev only: lets a phone on the home network open `next dev` (e.g. http://192.168.1.17:3000).
  // Without this, Next blocks its dev scripts for other hosts and the page never hydrates.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
};

export default nextConfig;
