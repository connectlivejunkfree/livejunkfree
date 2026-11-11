import Link from "next/link";
import { Icon } from "@/components/icons";
import { CountUp } from "@/components/motion/CountUp";
import { PageShell } from "@/components/designed/layout/PageShell";
import { AreasTop } from "@/components/designed/sections/Areas";
import { BeforeAfter } from "@/components/designed/sections/BeforeAfter";
import { Faq, Sec, SecHead, Steps } from "@/components/designed/sections/Blocks";
import { CtaBand } from "@/components/designed/sections/CtaBand";
import { HomeHero } from "@/components/designed/sections/HomeHero";
import { LoadMeter } from "@/components/designed/sections/LoadMeter";
import { Reviews } from "@/components/designed/sections/Reviews";
import { ServicesBento } from "@/components/designed/sections/ServicesBento";
import { ItemMarquee, TrustStrip } from "@/components/designed/sections/Strips";
import { JsonLd } from "@/components/designed/ui/JsonLd";
import { FAQS } from "@content/designed/faqs";
import { HOME } from "@content/designed/pages/home";
import { REVIEW_SETS } from "@content/designed/reviews";
import { STATS } from "@content/designed/site";
import { HREF } from "@content/designed/routes";
import { STEPS_STD } from "@content/designed/shared";
import { breadcrumbs, localBusiness } from "@/components/designed/lib/schema";


export function HomePage() {
  const d = HOME.destinations;
  return (
    <PageShell>
      <JsonLd data={localBusiness()} />
      <JsonLd data={breadcrumbs([{ label: "Home", href: "/" }], "/")} />
      <HomeHero />
      <ItemMarquee items={HOME.marquee} />
      <TrustStrip />

      <Sec>
        <SecHead title={HOME.bento.title} intro={HOME.bento.intro} />
        <ServicesBento />
      </Sec>

      <Sec>
        <SecHead title={HOME.beforeAfter.title} intro={HOME.beforeAfter.intro} />
        <BeforeAfter before={HOME.beforeAfter.before} after={HOME.beforeAfter.after} />
      </Sec>

      <Sec>
        <SecHead title={HOME.pricing.title} intro={HOME.pricing.intro} />
        <LoadMeter compact />
      </Sec>

      <Sec>
        <SecHead title={HOME.steps.title}>
          <Link className="btn btn-ghost" href={HREF.how}>
            {HOME.steps.cta}
          </Link>
        </SecHead>
        <Steps list={STEPS_STD} />
      </Sec>

      <Sec>
        <Reviews ids={REVIEW_SETS.home} />
      </Sec>

      <Sec variant="tight">
        <h2 className="d3 mb-6">{HOME.stats.title}</h2>
        <div className="stats">
          {STATS.map((st) => (
            <div key={st.label}>
              <b>
                <CountUp value={st.value} />
              </b>
              <span>{st.label}</span>
            </div>
          ))}
        </div>
      </Sec>

      <Sec>
        <SecHead title={d.title} intro={d.intro} />
        <div className="dest">
          <div>
            <b className="text-[clamp(1.8rem,2.6vw,2.4rem)]! leading-[1.05]!">{d.lead.title}</b>
            <p className="mt-auto">{d.lead.text}</p>
          </div>
          {d.items.map((i) => (
            <div key={i.label}>
              <div className={i.leaf ? "icon leaf" : "icon"}>
                <Icon name={i.icon} />
              </div>
              <span className="lab">{i.label}</span>
              <p>{i.text}</p>
            </div>
          ))}
        </div>
      </Sec>

      <Sec>
        <SecHead title={HOME.areas.title} intro={HOME.areas.intro} />
        <AreasTop />
      </Sec>

      <Sec>
        <Faq list={FAQS.home} />
      </Sec>
      <CtaBand />
    </PageShell>
  );
}
