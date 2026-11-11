"use client";

/**
 * next/image loader: points every local photo at its pre-built WebP file
 * (made by scripts/build-images.mjs at build time) instead of converting it on
 * request. Keep WIDTHS in sync with that script.
 */
const WIDTHS = [128, 384, 640, 828, 1200, 1600];

export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  if (!src.startsWith("/images/") || !/\.(jpe?g|png|webp)$/i.test(src)) return src;
  const w = WIDTHS.find((x) => x >= width) ?? WIDTHS[WIDTHS.length - 1];
  return `/_img/${src.slice("/images/".length)}-${w}.webp`;
}
