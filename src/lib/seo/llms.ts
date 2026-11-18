/**
 * llms.txt / llms-full.txt (generative-engine optimisation). Built only from
 * facts already on the site: content/site.json and each page's own copy.
 */
import { builtRows, fact, getDoc, resolvePrices, site, type ManifestRow } from "@/lib/content";
import { summary } from "@/lib/content/page";
import { blockText } from "@/lib/content/text";
import { inlinePlainText } from "./text";
import { abs } from "./schema";

const tidy = (t: string) => t.replace(/\s*[-|–]\s*Live\s?Junk\s?Free.*$/i, "").trim();
// The page's own (rule-processed) description, not the manifest's copy of the original WordPress text.
const line = (r: ManifestRow) => {
  const doc = getDoc(r.path);
  const d = doc?.seo?.description ?? r.description;
  return `- [${tidy(doc?.seo?.title || doc?.title || r.title)}](${abs(r.path)})${d ? `: ${d}` : ""}`;
};

export function llmsTxt(): string {
  const rows = builtRows();
  const pick = (t: string) => rows.filter((r) => r.type === t);
  return resolvePrices(`# ${site.name}

> ${site.name} provides residential and commercial junk removal, cleanouts and demolition across the Greater Toronto Area (Ontario, Canada). Phone ${site.phone.display}, email ${site.email}. ${fact("businessHours")}. ${fact("sameDay")}.

## Contact
- Phone: ${site.phone.display} (tel:${site.phone.tel})
- Email: ${site.email}
- Book online: ${abs("/contact/")}
- Google Business Profile: ${site.googleBusinessProfile}

## Service areas (Ontario, Canada)
${site.towns.map((t) => `- [${t.name}](${abs(`/locations/${t.slug}/`)})`).join("\n")}

## Service categories
${pick("service-hub").map(line).join("\n")}

## Services
${pick("service").map(line).join("\n")}

## Key pages
${pick("core").map(line).join("\n")}

## Optional
- [Full page summaries and FAQs](${abs("/llms-full.txt")})
`);
}

export function llmsFullTxt(): string {
  const rows = builtRows().filter((r) => ["core", "service", "service-hub", "location-town", "location-service", "landing"].includes(r.type));
  const parts = rows.map((r) => {
    const doc = getDoc(r.path)!;
    const faqs = doc.sections.flatMap((s) => s.blocks).flatMap((b) => (b.t === "faq" ? b.items : []));
    const sum = summary(doc).join(" ");
    return [
      `## ${doc.h1}`,
      `URL: ${abs(r.path)}`,
      sum ? `\n${sum}` : "",
      faqs.length ? `\n### FAQ\n${faqs.map((f) => `- Q: ${f.q}\n  A: ${f.a.map(inlinePlainText).join(" ")}`).join("\n")}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  });
  // {{fact:…}} / {{min_price}} tokens resolve exactly as they do on the pages.
  return resolvePrices(`# ${site.name} — page summaries\n\nEvery summary is quoted from the page itself. Phone ${site.phone.display}.\n\n${parts.join("\n\n")}\n`);
}

export { blockText };
