/**
 * Loads every built route from .next/server/app and extracts what the checks look at:
 * visible text, <title>, meta description, image alt text and every JSON-LD block.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { all, hidden, ldStrings, parse, text } from "./html.mjs";

export const ROOT = process.cwd();
const APP = join(ROOT, ".next/server/app");

/** The 50 Batch 1 pages (B1-12, the estate thank-you page, is deliberately excluded). */
export const BATCH = JSON.parse(readFileSync(join(ROOT, "scripts/checks/batch-1-pages.json"), "utf8")).filter((p) => p.path);
export const BATCH_PATHS = new Map(BATCH.map((p) => [p.path, p.id]));

export function routes() {
  const files = [];
  const rec = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) rec(p);
      else if (p.endsWith(".html")) files.push(p);
    }
  };
  rec(APP);
  return files
    .map((f) => {
      let r = "/" + relative(APP, f).replace(/\.html$/, "");
      r = r === "/index" ? "/" : r + "/";
      return { route: r, file: f };
    })
    .filter((r) => !/^\/(_not-found|_global-error|404|500|admin)/.test(r.route) && !/thank/.test(r.route));
}

export function load(file) {
  const html = readFileSync(file, "utf8");
  const tree = parse(html);
  const title = (all(tree, (n) => n.tag === "title")[0]?.children?.[0]?.text ?? "").trim();
  const meta = all(tree, (n) => n.tag === "meta" && n.attrs.name === "description")[0]?.attrs.content ?? "";
  const alts = all(tree, (n) => n.tag === "img" && !hidden(n)).map((n) => n.attrs.alt ?? "").filter((a) => a.trim());
  const ld = [];
  const ldErrors = [];
  for (const s of all(tree, (n) => n.tag === "script" && n.attrs.type === "application/ld+json")) {
    try { ld.push(JSON.parse(s.raw)); } catch (e) { ldErrors.push(String(e.message)); }
  }
  const body = all(tree, (n) => n.tag === "body")[0] ?? tree;
  return { html, tree, body, title, meta, alts, ld, ldErrors, visible: text(body), ldText: ld.flatMap((x) => ldStrings(x)) };
}
