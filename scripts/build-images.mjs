/**
 * Pre-builds every photo in public/images/ as WebP at a few fixed widths
 * (public/_img/<same path>-<width>.webp), so pages serve plain static files
 * from the CDN. No on-request image conversion, so images show instantly even
 * for a first visitor and there is no monthly image-optimization quota.
 *
 * Runs automatically before `npm run build` (the "prebuild" script).
 * Results are cached in .next/cache/ljf-img (Vercel keeps that folder between
 * builds), so only new or changed images are converted.
 * The widths must match src/lib/image-loader.ts.
 */
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { dirname, join, relative } from "node:path";
import sharp from "sharp";

const WIDTHS = [128, 384, 640, 828, 1200, 1600];
const QUALITY = 70;
const SRC = "public/images";
const OUT = "public/_img";
const CACHE = ".next/cache/ljf-img";

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(jpe?g|png|webp)$/i.test(e.name)) yield p;
  }
}

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function build(file) {
  const rel = relative(SRC, file);
  const buf = await readFile(file);
  const key = createHash("sha1").update(buf).digest("hex").slice(0, 16);
  const outs = WIDTHS.map((w) => [w, join(OUT, `${rel}-${w}.webp`), join(CACHE, key, `${w}.webp`)]);
  await mkdir(dirname(outs[0][1]), { recursive: true });

  if (!(await exists(outs.at(-1)[2]))) {
    await mkdir(join(CACHE, key), { recursive: true });
    const width = (await sharp(buf).metadata()).width ?? WIDTHS.at(-1);
    let last = null;
    for (const [w, , cached] of outs) {
      // Never upscale: widths above the original reuse the original-size encode.
      if (last && w > width) {
        await writeFile(cached, last);
        continue;
      }
      last = await sharp(buf).rotate().resize({ width: Math.min(w, width), withoutEnlargement: true }).webp({ quality: QUALITY }).toBuffer();
      await writeFile(cached, last);
    }
  }
  for (const [, out, cached] of outs) await copyFile(cached, out);
}

const t0 = Date.now();
const files = [];
for await (const f of walk(SRC)) files.push(f);
let i = 0;
const workers = Array.from({ length: Math.max(2, availableParallelism()) }, async () => {
  while (i < files.length) {
    const f = files[i++];
    try {
      await build(f);
    } catch (e) {
      console.warn(`images: skipped ${f} (${e.message})`);
    }
  }
});
await Promise.all(workers);
console.log(`images: ${files.length} photos × ${WIDTHS.length} widths ready in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
