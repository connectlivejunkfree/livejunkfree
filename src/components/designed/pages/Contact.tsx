import { PageShell } from "@/components/designed/layout/PageShell";
import { MapEmbed } from "@/components/designed/sections/Areas";
import { BookingForm } from "@/components/forms/BookingForm";
import { WordReveal } from "@/components/designed/sections/WordReveal";
import { Breadcrumbs } from "@/components/designed/ui/Breadcrumbs";
import { Ticks } from "@/components/designed/ui/Ticks";
import { CONTACT } from "@content/designed/pages/other";
import { HREF } from "@content/designed/routes";
import { HOURS, SITE } from "@content/designed/site";


export function ContactPage() {
  const C = CONTACT;
  return (
    <PageShell>
      <section className="sec white">
        <div className="wrap grid g2 items-start gap-[clamp(28px,5vw,72px)]!">
          <div className="stack-lg">
            <Breadcrumbs crumbs={[{ label: "Home", href: HREF.home }, { label: C.crumb }]} path={HREF.contact} />
            <h1 className="d1">
              <WordReveal text={C.h1} />
            </h1>
            <p className="lead">{C.lead}</p>
            <div className="panel stack">
              <p className="small muted">{C.fastest}</p>
              <a className="callbig" href={SITE.tel}>
                {SITE.phone}
              </a>
              <p className="small">
                <a className="tlink" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>
              </p>
              <p className="small muted">
                {C.hoursLabel} {HOURS.summary}
              </p>
            </div>
            <Ticks items={C.ticks} />
            <MapEmbed className="min-h-[260px]!" />
          </div>
          <div className="panel p-[clamp(20px,3vw,32px)]!">
            <BookingForm />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
