/** Plain text helpers for SEO outputs (resolves price tokens). */
import { resolvePrices, type Inline } from "@/lib/content";
import { inlineText } from "@/lib/content/text";

export const inlinePlainText = (c: Inline[]) => resolvePrices(inlineText(c));
