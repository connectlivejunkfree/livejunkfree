/** Plain text of content blocks (reading time, summaries, search). */
import type { Block, Inline } from "./schema";

export function inlineText(c: Inline[]): string {
  return c.map((n) => (typeof n === "string" ? n : "br" in n ? " " : "b" in n ? inlineText(n.b) : "i" in n ? inlineText(n.i) : inlineText(n.c))).join("");
}

export function blockText(b: Block): string {
  switch (b.t) {
    case "eyebrow":
    case "h":
      return b.text;
    case "p":
      return inlineText(b.c);
    case "ul":
    case "ol":
      return b.items.map(inlineText).join(" ");
    case "steps":
      return b.items.map((s) => `${s.title} ${s.text.map(inlineText).join(" ")}`).join(" ");
    case "cards":
      return b.items.map((c) => `${c.title} ${c.text ? inlineText(c.text) : ""}`).join(" ");
    case "checks":
      return b.items.join(" ");
    case "faq":
      return b.items.map((f) => `${f.q} ${f.a.map(inlineText).join(" ")}`).join(" ");
    default:
      return "";
  }
}
