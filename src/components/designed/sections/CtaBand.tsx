import { CTA_DEFAULT } from "@content/designed/shared";
import { SITE } from "@content/designed/site";
import type { CtaContent } from "@content/designed/types";
import { Rating } from "../ui/Rating";
import { Ticks } from "../ui/Ticks";
import { QuoteForm } from "@/components/forms/QuoteForm";

/**
 * Orange CTA band with rating, call link and quote form.
 * Inside a `.calm` page it becomes the dark slate variant.
 */
export function CtaBand({ h = CTA_DEFAULT.h, p = CTA_DEFAULT.p, form = {} }: CtaContent) {
  return (
    <section className="cta-band on-dark">
      <div className="wrap">
        <div className="stack-lg">
          <h2 className="d2">{h}</h2>
          <p className="lead">{p}</p>
          <div>
            <p className="muted small">{CTA_DEFAULT.callLabel}</p>
            <a className="callbig" href={SITE.tel}>
              {SITE.phone}
            </a>
          </div>
          <Ticks items={CTA_DEFAULT.ticks} />
          <Rating />
        </div>
        <div className="formbox">
          <QuoteForm {...form} />
        </div>
      </div>
    </section>
  );
}
