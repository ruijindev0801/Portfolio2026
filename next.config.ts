import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build a fully static site into `out/` — deploy it to Vercel, Netlify,
  // Cloudflare Pages, GitHub Pages or any static host.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
