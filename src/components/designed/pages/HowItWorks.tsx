import { PageShell } from "@/components/designed/layout/PageShell";
import { Faq, PriceNote, Sec, SecHead, Steps } from "@/components/designed/sections/Blocks";
import { CtaBand } from "@/components/designed/sections/CtaBand";
import { LoadMeter } from "@/components/designed/sections/LoadMeter";
import { PageHero } from "@/components/designed/sections/ServiceHero";
import { Panel } from "@/components/designed/ui/Panel";
import { HOW_IT_WORKS } from "@content/designed/pages/other";
import { HREF } from "@content/designed/routes";


export function HowItWorksPage() {
  const P = HOW_IT_WORKS;
  return (
    <PageShell>
      <PageHero crumbs={[{ label: "Home", href: HREF.home }, { label: P.crumb }]} path={HREF.howItWorks} h1={P.h1} lead={P.lead} maxCh={18} />
      <Sec id="pricing" className="scroll-mt-24">
        <LoadMeter />
      </Sec>
      <Sec variant="white">
        <SecHead title={P.factors.title} />
        <div className="grid g3">
          {P.factors.items.map((f) => (
            <Panel key={f.title} variant="flat" {...f} />
          ))}
        </div>
      </Sec>
      <Sec>
        <SecHead title={P.examples.title} />
        <PriceNote text={P.examples.text} />
      </Sec>
      <Sec variant="slate" id="how" className="scroll-mt-24">
        <SecHead title={P.steps.title} />
        <Steps list={P.steps.list} />
      </Sec>
      <Sec variant="white">
        <Faq list={P.faq} />
      </Sec>
      <CtaBand />
    </PageShell>
  );
}
