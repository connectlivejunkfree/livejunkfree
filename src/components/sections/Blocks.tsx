/**
 * FAQ accordion and numbered process steps.
 * Content fields used: faq block items { q, a: Inline[][] }; steps block items { n, title, text: Inline[][] }.
 * FAQs render as real <details> HTML (crawlable, works without JS) and emit FAQPage JSON-LD.
 */
import type { Inline } from "@/lib/content";
import { faqPage } from "@/lib/seo/schema";
import { JsonLd } from "../ui/JsonLd";
import { inlinePlain, renderInline } from "../ui/InlineText";

export function Faq({ items }: { items: { q: string; a: Inline[][] }[] }) {
  return (
    <>
      <div className="faq">
        {items.map((f, i) => (
          <details key={f.q + i} open={i === 0}>
            <summary>{f.q}</summary>
            <div className="faq-a">
              {f.a.map((p, k) => (
                <p key={k}>{renderInline(p, `faq${i}-${k}`)}</p>
              ))}
            </div>
          </details>
        ))}
      </div>
      <JsonLd data={faqPage(items.map((f) => ({ q: f.q, a: f.a.map(inlinePlain).join(" ") })))} />
    </>
  );
}

export function Steps({ list }: { list: { n?: string; title: string; text: Inline[][] }[] }) {
  return (
    <ol className="steps" style={{ "--n": Math.min(list.length, 4) } as React.CSSProperties}>
      {list.map((s, i) => (
        <li key={s.title + i} className="step">
          <span className="n" aria-hidden="true">
            {s.n ?? String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="h4">{s.title}</h3>
          {s.text.map((p, k) => (
            <p key={k}>{renderInline(p, `step${i}-${k}`)}</p>
          ))}
        </li>
      ))}
    </ol>
  );
}
