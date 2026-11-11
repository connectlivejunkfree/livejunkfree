import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** 301 redirects from content/redirects.csv (from,to,status,source). 410s are handled in src/proxy.ts. */
function csvRedirects() {
  const csv = readFileSync(join(process.cwd(), "content", "redirects.csv"), "utf8");
  return csv
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && !l.startsWith("from,"))
    .map((l) => l.split(","))
    .filter(([from, to, status]) => from && to && status === "301")
    .map(([from, to]) => ({ source: from, destination: to, permanent: true }));
}

const nextConfig: NextConfig = {
  // The review bar shows which phase this build is (BUILD_PHASE in .env).
  env: { NEXT_PUBLIC_BUILD_PHASE: process.env.BUILD_PHASE ?? "1" },
  // Every old WordPress URL ends in "/": keep it that way.
  trailingSlash: true,
  async redirects() {
    return csvRedirects();
  },
  async rewrites() {
    return {
      // Old image URLs (Google Images, backlinks) keep working.
      beforeFiles: [{ source: "/wp-content/uploads/:path*", destination: "/images/uploads/:path*" }],
      afterFiles: [],
      fallback: [],
    };
  },
  // Photos are pre-built as WebP at fixed widths (scripts/build-images.mjs) and
  // served as static files; src/lib/image-loader.ts picks the right width.
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [640, 828, 1200, 1600],
    imageSizes: [128, 384],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/_img/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
  // Content files are read at build time; include them for any server-rendered route too.
  outputFileTracingIncludes: { "/*": ["./content/**/*.json"] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
