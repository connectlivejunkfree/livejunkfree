import Image from "next/image";
import Link from "next/link";
import { IMG } from "@content/designed/images";
import { HOME } from "@content/designed/pages/home";
import { HREF } from "@content/designed/routes";
import { RATING, SITE } from "@content/designed/site";
import { Icon } from "@/components/icons";
import { Stars } from "../ui/Stars";
import { QuickQuote } from "./QuickQuote";
import { WordReveal } from "./WordReveal";

const H = HOME.hero;

/** Full-bleed photo hero with word-by-word headline, rating pills and the quick quote card. */
export function HomeHero() {
  return (
    <section className="hero-home">
      <div className="bg parallax">
        <Image src={IMG[H.image]} alt={H.alt} fill sizes="100vw" quality={55} preload fetchPriority="high" className="object-[62%_40%]" />
      </div>
      <div className="wrap">
        <div className="stack-lg">
          <div className="pill-row intro" style={{ "--d": "0ms" } as React.CSSProperties}>
            <span className="gpill">
              <Stars /> {RATING.score} {H.pills.rating} · {RATING.count} reviews
            </span>
            <span className="gpill">
              <Icon name="clock" /> {H.pills.sameDay}
            </span>
          </div>
          <h1 className="d1">
            <WordReveal text={H.h1} />
          </h1>
          <p className="lead intro" style={{ "--d": "450ms" } as React.CSSProperties}>
            {H.lead}
          </p>
          <div className="btn-row intro" style={{ "--d": "600ms" } as React.CSSProperties}>
            <Link className="btn btn-primary" href={HREF.contact}>
              {H.primary}
            </Link>
            <a className="btn btn-ghost btn-glass" href={SITE.tel}>
              <Icon name="phone" /> {SITE.phone}
            </a>
          </div>
        </div>
        <QuickQuote />
      </div>
    </section>
  );
}
