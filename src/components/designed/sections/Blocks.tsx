/**
 * Small layout blocks: section wrapper, section head, steps, price note, FAQ.
 */
import type { ReactNode } from "react";
import { FAQ_DEFAULT_TITLE, type FaqList } from "@content/designed/faqs";
import Link from "next/link";
import { HREF } from "@content/designed/routes";
import { SITE } from "@content/designed/site";
import type { Step } from "@content/designed/types";
import { faqPage } from "@/components/designed/lib/schema";
import { JsonLd } from "../ui/JsonLd";
import { Rich } from "../ui/Rich";

type SecProps = {
  children: ReactNode;
  /** Design variants: "white", "tight", "slate" (dark rounded), combinable. */
  variant?: string;
  id?: string;
  className?: string;
  wrapClassName?: string;
};

/** `<section class="sec"><div class="wrap">…` */
export function Sec({ children, variant, id, className, wrapClassName }: SecProps) {
  const cls = ["sec", variant, variant?.includes("slate") ? "on-dark" : null, className].filter(Boolean).join(" ");
  return (
    <section className={cls} id={id}>
      <div className={wrapClassName ? `wrap ${wrapClassName}` : "wrap"}>{children}</div>
    </section>
  );
}

/** Section heading row: H2 left, intro text or action right. */
export function SecHead({ title, intro, children }: { title: string; intro?: string; children?: ReactNode }) {
  return (
    <div className="sec-head">
      <h2 className="d2">{title}</h2>
      {intro ? <p className="muted">{intro}</p> : null}
      {children}
    </div>
  );
}

/** Numbered process cards. Numbers pop in on reveal. */
export function Steps({ list }: { list: Step[] }) {
  return (
    <div className="steps" style={{ "--n": list.length } as React.CSSProperties}>
      {list.map((s, i) => (
        <div key={s.title} className="step">
          <div className="n" aria-hidden="true">
            {i + 1}
          </div>
          <h3 className="h4">{s.title}</h3>
          <p>
            <Rich text={s.text} />
          </p>
        </div>
      ))}
    </div>
  );
}

/** Published pricing as a highlighted line, with a quote button. */
export function PriceNote({ text }: { text: string }) {
  return (
    <div className="callout stack max-w-[72ch]">
      <p className="h4">{text}</p>
      <div className="btn-row">
        <Link className="btn btn-primary btn-sm" href={HREF.contact}>
          Get a free quote
        </Link>
        <a className="btn btn-ghost btn-sm" href={SITE.tel}>
          Call {SITE.phone}
        </a>
      </div>
    </div>
  );
}

/** FAQ built on <details>. First item open. Emits FAQPage JSON-LD. */
export function Faq({ list }: { list: FaqList }) {
  return (
    <div className="split">
      <div className="stack">
        <h2 className="d2">{list.title ?? FAQ_DEFAULT_TITLE}</h2>
        {list.intro ? <p className="muted">{list.intro}</p> : null}
        <p className="muted">
          Still unsure? Call{" "}
          <a className="tlink" href={SITE.tel}>
            {SITE.phone}
          </a>
        </p>
      </div>
      <div className="faq">
        {list.items.map((f, i) => (
          <details key={f.q} open={i === 0}>
            <summary>{f.q}</summary>
            <p>
              <Rich text={f.a} />
            </p>
          </details>
        ))}
      </div>
      <JsonLd data={faqPage(list.items)} />
    </div>
  );
}
