/**
 * Renders inline content from a content file: text, bold, italic, links,
 * line breaks. Resolves price tokens ({{cad_125}}) from content/pricing.json.
 * Internal links use Next.js <Link>; tel: links are tagged for call tracking.
 * Content fields used: any Inline[] (paragraphs, list items, FAQ answers, card text).
 */
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { manifestRow, resolvePrices, type Inline } from "@/lib/content";

const EXTRA_PATHS = /^\/(blog\/page\/\d+\/|feed\/|sitemap.*\.xml|llms.*\.txt)/;

export function renderInline(nodes: Inline[], keyPrefix = "i"): ReactNode[] {
  return nodes.map((n, i) => {
    const key = `${keyPrefix}-${i}`;
    if (typeof n === "string") return <Fragment key={key}>{resolvePrices(n)}</Fragment>;
    if ("br" in n) return <br key={key} />;
    if ("b" in n) return <strong key={key}>{renderInline(n.b, key)}</strong>;
    if ("i" in n) return <em key={key}>{renderInline(n.i, key)}</em>;
    const kids = renderInline(n.c, key);
    // A link around nothing but a space (the old editor left these): an invisible, unnamed link. Keep the space only.
    if (!inlinePlain(n.c).trim()) return <Fragment key={key}>{kids}</Fragment>;
    // Links that are broken on the live site too: keep the text, drop the link.
    if (n.a.startsWith("/") && !n.a.startsWith("/images/") && !manifestRow(n.a.split(/[?#]/)[0]) && !EXTRA_PATHS.test(n.a)) {
      return <Fragment key={key}>{kids}</Fragment>;
    }
    if (n.a.startsWith("/") && !n.a.startsWith("/images/")) {
      return (
        <Link key={key} href={n.a}>
          {kids}
        </Link>
      );
    }
    if (n.a.startsWith("tel:")) {
      return (
        <a key={key} href={n.a} data-track="phone">
          {kids}
        </a>
      );
    }
    return (
      <a key={key} href={n.a} {...(/^https?:/.test(n.a) ? { rel: "noopener" } : {})}>
        {kids}
      </a>
    );
  });
}

export function InlineText({ c }: { c: Inline[] }) {
  return <>{renderInline(c)}</>;
}

/** Plain text of inline content (for meta, JSON-LD, aria labels). */
export function inlinePlain(nodes: Inline[]): string {
  return resolvePrices(
    nodes
      .map((n) => (typeof n === "string" ? n : "br" in n ? " " : "b" in n ? inlinePlain(n.b) : "i" in n ? inlinePlain(n.i) : inlinePlain(n.c)))
      .join(""),
  );
}
