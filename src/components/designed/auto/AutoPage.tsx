/**
 * AutoPage — every non-demo page (service, cleanout, commercial, demolition,
 * town, location × service, Ads landing, category hub) in the client-approved
 * demo design. The words, prices, FAQs and photos come from the page's own
 * content file (content/pages/…); <normalize> cleans the old page structure
 * and this file lays it out with the demo's components and motion:
 *
 *   hero (demo split hero, or full-bleed photo + form for Ads pages)
 *   → sections, each given the design that fits its content:
 *       prose + photo → split with photo (alternating sides)
 *       H3 sub-sections → panel grid        numbered cards → step cards
 *       icon cards → panels / item chips    galleries → before/after slider or mosaic
 *       FAQs → split FAQ                    town lists → area chips + map
 *   → related links (chips) → closing orange quote band with the form.
 */
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { imageSize, liveHref, site, type Block, type BlockOf, type Image as ImageT, type Inline, type PageDoc } from "@/lib/content";
import { breadcrumbs } from "@/lib/content/page";
import { IMG, type ImageKey } from "@content/designed/images";
import { CTA_DEFAULT } from "@content/designed/shared";
import { Icon, type IconName } from "@/components/icons";
import { PageShell } from "@/components/layout/PageShell";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { MapEmbed } from "@/components/sections/Areas";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Faq, Steps } from "@/components/sections/Blocks";
import { SummaryBox } from "@/components/sections/Extras";
import { Reviews } from "@/components/sections/Reviews";
import { StatsGrid } from "@/components/sections/StatsGrid";
import { ItemMarquee } from "@/components/sections/Strips";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { inlinePlain, renderInline } from "@/components/ui/InlineText";
import { JsonLd } from "@/components/ui/JsonLd";
import { Rating } from "../ui/Rating";
import { WordReveal } from "../sections/WordReveal";
import { isIcon, isStepCards, listFaq, normalize, widthOf, stripNum, subsections, townList, type Head, type Part } from "./normalize";

export type Variant = "item" | "cleanout" | "commercial" | "demolition" | "town" | "location" | "ads" | "hub";
type Ctx = { variant: Variant; formAnchor: string };

/** Fallback hero photos (real Live Junk Free crew photos) when a page has none of its own. */
const FALLBACK: Record<Variant, ImageKey> = {
  item: "crewHero",
  cleanout: "estate",
  commercial: "business",
  demolition: "deckAfter",
  town: "crewStreet",
  location: "crewHero",
  ads: "crewHero",
  hub: "crewStreet",
};

/** Real crew photos from livejunkfree.ca, all ≥1024px (crew-truck.webp is only 394px: not used large). */
const CREW: ImageKey[] = ["crewAbout", "crewStreet", "job1", "job2", "job3", "crewHero"];
const CREW_ALT: Partial<Record<ImageKey, string>> = {
  crewAbout: "Live Junk Free crew member carrying boards to the truck",
  crewTruck: "Two Live Junk Free crew members at the truck",
  crewStreet: "Live Junk Free crew in front of the truck",
  job1: "Live Junk Free junk removal job",
  job2: "Live Junk Free junk removal job",
  job3: "Live Junk Free junk removal job",
  crewHero: "Live Junk Free crew loading the truck",
};

/** An icon from the site's set that matches a card title (the demo's panels all carry one). */
const ICON_RULES: [RegExp, IconName][] = [
  [/eco|recycl|donat|environment|green|sustainab/i, "leaf"],
  [/hot tub|jacuzzi|\btub\b|pool|water tank|spa\b/i, "tub"],
  [/piano/i, "piano"],
  [/tire/i, "tire"],
  [/mattress|bed\b|bedroom|box ?spring|bed bug/i, "bed"],
  [/sofa|couch|loveseat|sectional|recliner|chair|futon/i, "sofa"],
  [/fridge|freezer|appliance|washer|dryer|stove|microwave|dishwasher|oven/i, "fridge"],
  [/tv|television|electronic|computer|e-waste|printer|monitor/i, "tv"],
  [/gym|exercise|treadmill|fitness|elliptical/i, "dumbbell"],
  [/yard|tree|brush|garden|sod|soil|dirt|leaf|lawn|hedge/i, "tree"],
  [/demoli|shed|deck|fence|wall\b|tear|gazebo|playset|swing|pergola|hammer/i, "hammer"],
  [/desk|table|dresser|hutch|cabinet|wall unit|shelv|wardrobe|furniture|cubicle|safe\b/i, "box"],
  [/cardboard|paper|garbage|clutter|scrap|metal|wood|pallet|carpet|debris|drywall/i, "box"],
  [/office|commercial|business|retail|warehouse|store|property|restaurant/i, "building"],
  [/home|house|apartment|condo|garage|basement|estate|resident|attic|move/i, "home"],
  [/same.?day|time|fast|quick|hour|schedul|book|minute|efficien/i, "clock"],
  [/insur|safe|protect|guarant|secur|trust|licens|discreet/i, "shield"],
  [/price|pricing|cost|afford|rate|\$|save|discount|fee/i, "tag"],
  [/stair|floor/i, "stairs"],
  [/customer|satisf|friendly|people|team|crew|care|value|respect/i, "heart"],
  [/key|hand.?over|access/i, "key"],
  [/photo|picture/i, "camera"],
  [/quote|estimate|form|document/i, "file"],
  [/truck|haul|pickup|remov|disposal/i, "truck"],
];
const iconFor = (t: string): IconName => ICON_RULES.find(([re]) => re.test(t))?.[1] ?? "box";

const ECO = /eco|recycl|donat|environment|green|sustainab/i;
const short = (it: Inline[]) => inlinePlain(it).length < 48;

/* ───────────── small pieces ───────────── */

/**
 * One photo holding both "before" and "after" (labels printed on the image): never cropped,
 * or the labels at its edges get cut off. Shown whole at its own shape.
 */
const isCombinedBA = (im: ImageT) => /before.{0,12}after|after.{0,12}before/i.test(im.src.split("/").pop() ?? "");

function Cover({ image, sizes, priority, className }: { image: ImageT; sizes: string; priority?: boolean; className?: string }) {
  const whole = isCombinedBA(image);
  const sz = whole ? imageSize(image.src) : undefined;
  const cls = ["photo", className, whole ? "whole" : ""].filter(Boolean).join(" ");
  return (
    <div className={cls} style={sz ? { aspectRatio: `${sz.width} / ${sz.height}` } : undefined}>
      <Image src={image.src} alt={image.alt} fill sizes={sizes} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} />
    </div>
  );
}

function IconImg({ image }: { image: ImageT }) {
  return (
    <span className="icon img-icon" aria-hidden="true">
      <Image src={image.src} alt="" width={28} height={28} />
    </span>
  );
}

function ctaHref(href: string, ctx: Ctx) {
  if (!href || href === "/contact/" || /quote|book/i.test(href)) return ctx.formAnchor;
  return liveHref(href) ?? href;
}

/** Call-button labels always show the business number (one old page shows a wrong number). */
const telLabel = (label: string) => label.replace(/\(?\d{3}\)?[\s.-]*\d{3}[\s.-]*\d{4}/, site.phone.display.replace(/^\+1\s*/, ""));

function Buttons({ items, ctx, dark }: { items: { label: string; href: string }[]; ctx: Ctx; dark?: boolean }) {
  return (
    <div className="btn-row">
      {items.map((c, i) =>
        c.href.startsWith("tel:") ? (
          <a key={c.label + i} className={dark ? "btn btn-ghost btn-glass" : "btn btn-ghost"} href={`tel:${site.phone.tel}`} data-track="phone">
            <Icon name="phone" /> {telLabel(c.label)}
          </a>
        ) : (
          <Link key={c.label + i} className={i === 0 ? "btn btn-primary" : "btn btn-ghost"} href={ctaHref(c.href, ctx)}>
            {c.label}
          </Link>
        ),
      )}
    </div>
  );
}

/** Plain text blocks (paragraphs, lists, small headings, buttons). */
function Prose({ blocks, ctx, idx }: { blocks: Block[]; ctx: Ctx; idx: string }) {
  return (
    <>
      {blocks.map((b, k) => {
        const key = `${idx}-${k}`;
        switch (b.t) {
          case "p":
            return (
              <p key={key} className="muted">
                {renderInline(b.c, key)}
              </p>
            );
          case "h":
            return b.l <= 2 ? (
              <h3 key={key} className="d3">
                {b.text}
              </h3>
            ) : (
              <h3 key={key} className="h4">
                {b.text}
              </h3>
            );
          case "eyebrow":
            return (
              <p key={key} className="eyebrow">
                {b.text}
              </p>
            );
          case "ul":
          case "checks": {
            const items = b.t === "ul" ? b.items : b.items.map((s) => [s] as Inline[]);
            if (items.length >= 8 && items.every(short)) return <ChipGrid key={key} items={items} />;
            const two = items.length >= 4 && items.every(short);
            return (
              <ul key={key} className={two ? "ticks two" : "ticks"}>
                {items.map((it, i) => (
                  <li key={i}>{renderInline(it, `${key}-${i}`)}</li>
                ))}
              </ul>
            );
          }
          case "ol":
            return (
              <ol key={key} className="olist">
                {b.items.map((it, i) => (
                  <li key={i}>{renderInline(it, `${key}-${i}`)}</li>
                ))}
              </ol>
            );
          case "ctas":
            return <Buttons key={key} items={b.items} ctx={ctx} />;
          case "price":
            return (
              <div key={key} className="callout small">
                {b.label ? <b>{b.label} </b> : null}
                {renderInline([b.value], key)}
              </div>
            );
          default:
            return <Special key={key} b={b} ctx={ctx} idx={key} />;
        }
      })}
    </>
  );
}

/** Long lists of short items (services, items we take) → a grid of icon chips; links are kept. */
function ChipGrid({ items }: { items: Inline[][] }) {
  if (items.length > 16) {
    return (
      <div className="stack-sm">
        <ChipGrid items={items.slice(0, 15)} />
        <details className="chip-more">
          <summary>Show all {items.length}</summary>
          <ChipGrid items={items.slice(15)} />
        </details>
      </div>
    );
  }
  return (
    <ul className="chip-grid">
      {items.map((it, i) => {
        const text = inlinePlain(it).trim();
        const link = it.length === 1 && typeof it[0] === "object" && "a" in it[0] ? liveHref(it[0].a) : null;
        const inner = (
          <>
            <span className="ci" aria-hidden="true">
              <Icon name={iconFor(text)} />
            </span>
            <span>{text}</span>
          </>
        );
        return (
          <li key={text + i}>
            {link && link.startsWith("/") ? (
              <Link href={link} className="cg-item link">
                {inner}
                <Icon name="arrow" />
              </Link>
            ) : (
              <span className="cg-item">{inner}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const PROSE = new Set<Block["t"]>(["p", "h", "eyebrow", "ul", "ol", "checks", "ctas", "price"]);

/** Cards: step cards, icon panels, item chips, text panels or photo cards. */
function Cards({ b, title, idx }: { b: BlockOf<"cards">; title?: string; idx: string }) {
  if (isStepCards(b, title)) return <Steps list={b.items.map((c) => ({ title: stripNum(c.title), text: c.text ? [c.text] : [] }))} />;
  const icons = b.items.every((c) => c.image && isIcon(c.image));
  const photos = b.items.some((c) => c.image && !isIcon(c.image));
  const anyText = b.items.some((c) => c.text);
  const link = (c: (typeof b.items)[number]) => {
    const h = c.href ? liveHref(c.href) : null;
    return h && h.startsWith("/") ? h : null;
  };
  // Titles only (with or without small icons) → item chips.
  if (!anyText && !photos) {
    return (
      <div className="items">
        {b.items.map((c, i) => {
          const inner = (
            <>
              <span className="ci" aria-hidden="true">
                <Icon name={iconFor(c.title)} />
              </span>
              {c.title.trim()}
            </>
          );
          const h = link(c);
          return h ? (
            <Link key={c.title + i} className="item" href={h}>
              {inner}
            </Link>
          ) : (
            <span key={c.title + i} className="item">
              {inner}
            </span>
          );
        })}
      </div>
    );
  }
  if (photos) {
    const cols = b.items.length % 3 === 0 ? "g3" : b.items.length === 4 ? "g4" : "g2";
    return (
      <div className={`grid ${cols} cards`}>
        {b.items.map((c, i) => {
          const h = link(c);
          const inner = (
            <>
              {c.image && !isIcon(c.image) ? (
                <Cover image={c.image} sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 400px" className="card-photo" />
              ) : (
                <div className="photo card-photo card-ph" aria-hidden="true">
                  <Icon name={iconFor(c.title)} />
                </div>
              )}
              <div className="card-body">
                <h3 className="h4">{c.title}</h3>
                {c.text ? <p className="small muted">{h ? inlinePlain(c.text) : renderInline(c.text, `${idx}c${i}`)}</p> : null}
              </div>
            </>
          );
          return h ? (
            <Link key={c.title + i} className="panel card link-card" href={h}>
              {inner}
              <span className="go" aria-hidden="true">
                <Icon name="arrow" />
              </span>
            </Link>
          ) : (
            <div key={c.title + i} className="panel card">
              {inner}
            </div>
          );
        })}
      </div>
    );
  }
  // Text panels (icon tile when the old card had an icon; green "leaf" panel for eco points).
  const cols = b.items.length === 4 || b.items.length === 2 ? "g2" : "g3";
  return (
    <div className={`grid ${cols}`}>
      {b.items.map((c, i) => {
        const leaf = ECO.test(c.title);
        const h = link(c);
        const body = (
          <>
            {icons && c.image ? (
              <IconImg image={c.image} />
            ) : (
              <span className={leaf ? "icon leaf" : "icon"} aria-hidden="true">
                <Icon name={iconFor(c.title)} />
              </span>
            )}
            <h3 className="h4">{c.title.trim()}</h3>
            {c.text ? <p className="small muted">{h ? inlinePlain(c.text) : renderInline(c.text, `${idx}p${i}`)}</p> : null}
          </>
        );
        return h ? (
          <Link key={c.title + i} href={h} className={leaf ? "panel leaf link-card" : "panel link-card"}>
            {body}
          </Link>
        ) : (
          <div key={c.title + i} className={leaf ? "panel leaf" : "panel"}>
            {body}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Photo mosaic. Largest photo first (big cell) when it is large enough; the next largest
 * take the wide cells so no small photo is ever stretched; rows always end flush.
 */
function Mosaic({ images: raw }: { images: ImageT[] }) {
  let images = [...raw].sort((a, b) => widthOf(b) - widthOf(a));
  // 2–3 photos fill big cells: only photos large enough for them.
  if (images.length <= 3) images = images.filter((im) => widthOf(im) >= 560);
  if (!images.length) return null;
  if (images.length === 1) return <Cover image={images[0]} className="solo" sizes="(max-width: 960px) 100vw, 800px" />;
  const flat = images.length >= 4 && widthOf(images[0]) < 600;
  const cells = (k: number) => (flat ? k : k + 3); // the big first photo takes 4 cells
  let gap = images.length >= 4 ? (4 - (cells(images.length) % 4)) % 4 : 0;
  // Wide cells need photos ≥600px; otherwise use fewer photos so the grid still ends flush.
  const wideOk = (k: number) => images.slice(1, 1 + k).every((im) => widthOf(im) >= 600);
  while (gap && !wideOk(gap === 3 ? 1 : gap) && images.length > 4) {
    images = images.slice(0, -1);
    gap = (4 - (cells(images.length) % 4)) % 4;
  }
  const wide = new Map<number, string>();
  if (gap === 1 || gap === 2) for (let k = 1; k <= gap; k++) wide.set(k, "w2");
  if (gap === 3) wide.set(1, "w4");
  const n = images.length;
  const small = n <= 3;
  return (
    <div className={flat ? "mosaic flat" : small ? `mosaic n${n}` : "mosaic"}>
      {images.map((im, i) => {
        const span = wide.get(i);
        const big = (i === 0 && !flat) || span === "w4" || small;
        return <Cover key={im.src + i} image={im} className={span} sizes={big ? "(max-width: 960px) 100vw, 1200px" : span ? "(max-width: 960px) 100vw, 640px" : "(max-width: 960px) 50vw, 320px"} />;
      })}
    </div>
  );
}

function Areas({ names }: { names: string[] }) {
  const bySlug = new Map(site.towns.flatMap((t) => [[t.name.toLowerCase(), t], [t.slug, t]]));
  return (
    <ul className="areas">
      {names.map((n) => {
        const l = n.toLowerCase();
        const t = bySlug.get(l) ?? bySlug.get(l.replace(/[\s–—-]+/g, "-")) ?? (l === "stouffville" ? bySlug.get("whitchurch-stouffville") : l === "newmarket" ? bySlug.get("new-market") : undefined);
        return <li key={n}>{t ? <Link href={`/locations/${t.slug}/`}>{n}</Link> : <span>{n}</span>}</li>;
      })}
    </ul>
  );
}

/** Non-prose blocks. */
function Special({ b, ctx, idx, title }: { b: Block; ctx: Ctx; idx: string; title?: string }): ReactNode {
  switch (b.t) {
    case "cards":
      return <Cards b={b} title={title} idx={idx} />;
    case "faq": {
      const lines = listFaq(b);
      if (lines)
        return (
          <details className="more-items">
            <summary>
              {b.items[0].q} <span className="muted small">({lines.length})</span>
            </summary>
            <div className="items">
              {lines.map((l) => (
                <span key={l} className="item">
                  {l}
                </span>
              ))}
            </div>
          </details>
        );
      return <Faq items={b.items} />;
    }
    case "steps":
      return <Steps list={b.items.map((s) => ({ title: stripNum(s.title), text: s.text }))} />;
    case "gallery": {
      const before = b.images.find((i) => /before/i.test(i.src + i.alt));
      const after = b.images.find((i) => i !== before && /after/i.test(i.src + i.alt));
      if (b.images.length === 2 && before && after) {
        // The slider fills the full width: only for photos big enough; smaller pairs sit side by side.
        if (widthOf(before) >= 700 && widthOf(after) >= 700) return <BeforeAfter before={before} after={after} />;
        return (
          <div className="ba-pair">
            <figure>
              <Cover image={before} sizes="400px" />
              <figcaption>Before</figcaption>
            </figure>
            <figure>
              <Cover image={after} sizes="400px" />
              <figcaption>After</figcaption>
            </figure>
          </div>
        );
      }
      return <Mosaic images={b.images} />;
    }
    case "stats":
      return <StatsGrid items={b.items} />;
    case "marquee":
      return <ItemMarquee items={b.items} />;
    case "map":
      return <MapEmbed className="min-h-[320px]!" />;
    case "video":
      return (
        <video className="video" src={b.src} muted loop playsInline autoPlay preload="none" aria-hidden="true">
          <track kind="captions" />
        </video>
      );
    case "reviews":
      return <Reviews />;
    case "rating":
      return <Rating />;
    case "img":
      return <Cover image={b.image} sizes="(max-width: 960px) 100vw, 600px" />;
    case "ul": {
      const towns = townList(b);
      if (towns) return <Areas names={towns} />;
      return <Prose blocks={[b]} ctx={ctx} idx={idx} />;
    }
    default:
      return <Prose blocks={[b]} ctx={ctx} idx={idx} />;
  }
}

function HeadView({ head, as = "h2", id }: { head: Head; as?: "h2" | "h1"; id?: string }) {
  const H = as;
  return (
    <>
      {head.eyebrow ? <p className="eyebrow">{head.eyebrow}</p> : null}
      {head.title ? (
        <H className={head.title.length > 64 ? "d2 d2-long" : "d2"} id={id}>
          {head.title}
        </H>
      ) : null}
    </>
  );
}

/* ───────────── one section ───────────── */

function PartView({ p, i, ctx, photo, textIdx = 0 }: { p: Part; i: number; ctx: Ctx; photo?: ImageT; textIdx?: number }) {
  const tone = i % 2 === 0 ? "sec white" : "sec";
  const id = `p${i}`;
  const blocks = p.blocks;
  const has = (t: Block["t"]) => blocks.some((b) => b.t === t);
  const towns = blocks.some((b) => townList(b));

  // A run of tiny old sections → one panel grid.
  if (p.group) {
    const g = p.group;
    const cols = g.length === 4 ? "g4" : g.length % 3 === 0 ? "g3" : "g2";
    return (
      <section className={tone}>
        <div className="wrap stack-lg">
          {p.head.eyebrow ? (
            <div className="sec-head">
              <div className="stack-sm">
                <h2 className="d2">{p.head.eyebrow}</h2>
              </div>
            </div>
          ) : null}
          <div className={`grid ${cols}`}>
            {g.map((s, k) => {
              const leaf = ECO.test(s.title);
              return (
                <div key={s.title + k} className={leaf ? "panel leaf" : "panel"}>
                  <span className={leaf ? "icon leaf" : "icon"} aria-hidden="true">
                    <Icon name={iconFor(s.title)} />
                  </span>
                  <h3 className="h4">{s.title}</h3>
                  <Prose blocks={s.body} ctx={ctx} idx={`${id}g${k}`} />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // FAQ: title left, questions right (demo layout).
  if (blocks.some((b) => b.t === "faq" && !listFaq(b))) {
    const k = blocks.findIndex((b) => b.t === "faq" && !listFaq(b));
    const before = blocks.slice(0, k);
    const after = blocks.slice(k + 1);
    const faqs = blocks.filter((b): b is BlockOf<"faq"> => b.t === "faq" && !listFaq(b)).flatMap((b) => b.items);
    return (
      <section className={tone} aria-labelledby={`${id}-h`}>
        <div className="wrap">
          <div className="split">
            <div className="stack">
              <HeadView head={{ ...p.head, title: p.head.title ?? "Frequently Asked Questions" }} id={`${id}-h`} />
              <Prose blocks={before} ctx={ctx} idx={id} />
              <p className="muted">
                Still unsure? Call{" "}
                <a className="tlink" href={`tel:${site.phone.tel}`} data-track="phone">
                  {site.phone.display}
                </a>
              </p>
            </div>
            <Faq items={faqs} />
          </div>
          {after.filter((b) => b.t !== "faq" || listFaq(b)).length ? (
            <div className="stack mt-10">
              {after.filter((b) => b.t !== "faq" || listFaq(b)).map((b, k) => (
                <Special key={k} b={b} ctx={ctx} idx={`${id}a${k}`} title={p.head.title} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  // Reviews: the demo's score + review cards.
  if (has("reviews") && blocks.every((b) => b.t === "reviews" || PROSE.has(b.t))) {
    return (
      <section className={tone}>
        <div className="wrap stack-lg">
          {p.head.title || p.head.eyebrow ? (
            <div className="sec-head">
              <div className="stack-sm">
                <HeadView head={p.head} />
              </div>
            </div>
          ) : null}
          <Reviews />
          {blocks.some((b) => b.t !== "reviews") ? <Prose blocks={blocks.filter((b) => b.t !== "reviews")} ctx={ctx} idx={id} /> : null}
        </div>
      </section>
    );
  }

  // Town list: heading + text left, area chips right, map below.
  if (towns) {
    const other = blocks.filter((b) => !townList(b));
    const names = blocks.flatMap((b) => townList(b) ?? []);
    return (
      <section className={tone} aria-labelledby={`${id}-h`}>
        <div className="wrap stack-lg">
          <div className="split">
            <div className="stack">
              <HeadView head={p.head} id={`${id}-h`} />
              <Prose blocks={other} ctx={ctx} idx={id} />
            </div>
            <Areas names={names} />
          </div>
          {ctx.variant === "location" ? <MapEmbed className="min-h-[320px]!" /> : null}
        </div>
      </section>
    );
  }

  const prose = blocks.every((b) => PROSE.has(b.t));
  if (prose) {
    const [intro, subs] = subsections(blocks);
    // Sub-sections (H3/H4 + text) → panel grid.
    if (subs.length >= 2 && subs.every((s) => s.body.length)) {
      const longest = Math.max(...subs.map((s) => s.body.map(blockLen).reduce((a, b) => a + b, 0)));
      const cols = longest > 650 ? "rows" : subs.length === 2 || subs.length === 4 ? "g2" : "g3";
      return (
        <section className={tone} aria-labelledby={p.head.title ? `${id}-h` : undefined}>
          <div className="wrap stack-lg">
            {p.head.title || p.head.eyebrow || intro.length ? (
              <div className="sec-head">
                <div className="stack-sm">
                  <HeadView head={p.head} id={`${id}-h`} />
                </div>
                {intro.length ? (
                  <div className="stack">
                    <Prose blocks={intro} ctx={ctx} idx={`${id}i`} />
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className={`grid ${cols} subs`}>
              {subs.map((s, k) => (
                <div key={s.title + k} className={ECO.test(s.title) ? "panel leaf stack-sm" : "panel stack-sm"}>
                  <span className="sub-n" aria-hidden="true">
                    {String(k + 1).padStart(2, "0")}
                  </span>
                  <h3 className="h4">{s.title}</h3>
                  <Prose blocks={s.body} ctx={ctx} idx={`${id}s${k}`} />
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }
    // Text + photo → split with photo (sides alternate).
    const img = p.image ?? photo;
    if (img) {
      return (
        <section className={tone} aria-labelledby={p.head.title ? `${id}-h` : undefined}>
          <div className="wrap">
            <div className={i % 2 ? "split-media flip" : "split-media"}>
              <div className="stack">
                <HeadView head={p.head} id={`${id}-h`} />
                <Prose blocks={blocks} ctx={ctx} idx={id} />
              </div>
              <Cover image={img} sizes="(max-width: 960px) 100vw, 560px" className="tilt" />
            </div>
          </div>
        </section>
      );
    }
    // Text only: three designs in rotation so consecutive text sections never look the same.
    const totalLen = blocks.reduce((n, b) => n + blockLen(b), 0);
    let style = p.head.title ? textIdx % 3 : 0;
    if (style === 1 && totalLen < 380) style = 0; // the tinted band needs enough text to fill it
    if (style === 2 && (blocks[0]?.t !== "p" || totalLen < 380)) style = 0;
    if (style === 1) {
      return (
        <section className={tone} aria-labelledby={`${id}-h`}>
          <div className="wrap">
            <div className="prose-band stack-lg">
              <div className="sec-head">
                <div className="stack-sm">
                  <HeadView head={p.head} id={`${id}-h`} />
                </div>
              </div>
              <div className={totalLen > 700 ? "prose-cols" : "stack content-col"}>
                <Prose blocks={blocks} ctx={ctx} idx={id} />
              </div>
            </div>
          </div>
        </section>
      );
    }
    if (style === 2 && blocks.length >= 2) {
      const [first, ...rest] = blocks;
      return (
        <section className={tone} aria-labelledby={`${id}-h`}>
          <div className="wrap stack-lg">
            <div className="stack-sm">
              <HeadView head={p.head} id={`${id}-h`} />
            </div>
            <div className="lead-split">
              <p className="lead-xl">{renderInline((first as BlockOf<"p">).c, `${id}-l`)}</p>
              <div className="panel stack">
                <Prose blocks={rest} ctx={ctx} idx={id} />
              </div>
            </div>
          </div>
        </section>
      );
    }
    // Heading left (sticky), text right.
    return (
      <section className={tone} aria-labelledby={p.head.title ? `${id}-h` : undefined}>
        <div className="wrap">
          {p.head.title ? (
            <div className="split">
              <div className="stack">
                <HeadView head={p.head} id={`${id}-h`} />
              </div>
              <div className="stack">
                <Prose blocks={blocks} ctx={ctx} idx={id} />
              </div>
            </div>
          ) : (
            <div className="stack content-col">
              <Prose blocks={blocks} ctx={ctx} idx={id} />
            </div>
          )}
        </div>
      </section>
    );
  }

  // Heading + a line or two + buttons only → a designed call-to-action banner.
  const ctaOnly =
    blocks.some((b) => b.t === "ctas") &&
    blocks.every((b) => b.t === "ctas" || (b.t === "h" && b.text.length <= 140) || (b.t === "p" && inlinePlain(b.c).length <= 220)) &&
    blocks.filter((b) => b.t !== "ctas").length <= 3;
  if (ctaOnly && !p.image) {
    const lines = blocks.filter((b) => b.t !== "ctas");
    const btns = blocks.filter((b): b is BlockOf<"ctas"> => b.t === "ctas").flatMap((b) => b.items);
    return (
      <section className="sec tight">
        <div className="wrap">
          <div className="cta-strip on-dark">
            <span className="cta-strip-ic" aria-hidden="true">
              <Icon name="truck" />
            </span>
            <div className="stack-sm">
              {p.head.eyebrow ? <p className="eyebrow">{p.head.eyebrow}</p> : null}
              {p.head.title ? <h2 className="d3">{p.head.title}</h2> : null}
              {lines.map((b, k) =>
                b.t === "h" ? (
                  <p key={k} className="lead">
                    {b.text}
                  </p>
                ) : b.t === "p" ? (
                  <p key={k} className="lead">
                    {renderInline(b.c, `${id}c${k}`)}
                  </p>
                ) : null,
              )}
            </div>
            <Buttons items={btns} ctx={ctx} dark />
          </div>
        </div>
      </section>
    );
  }

  // Mixed section: head row (title left, short intro right), then the content in order.
  const first = blocks[0];
  const introP = first?.t === "p" && inlinePlain(first.c).length < 320 ? first : null;
  const body = introP ? blocks.slice(1) : blocks;
  // Narrow mixed section with its own photo → text + photo side by side.
  if (p.image && !isWide(blocks)) {
    return (
      <section className={tone} aria-labelledby={p.head.title ? `${id}-h` : undefined}>
        <div className="wrap">
          <div className={i % 2 ? "split-media flip" : "split-media"}>
            <div className="stack">
              <HeadView head={p.head} id={`${id}-h`} />
              {groupProse(blocks).map((g, k) => (Array.isArray(g) ? <Prose key={k} blocks={g} ctx={ctx} idx={`${id}m${k}`} /> : <Special key={k} b={g} ctx={ctx} idx={`${id}m${k}`} title={p.head.title} />))}
            </div>
            <Cover image={p.image} sizes="(max-width: 960px) 100vw, 560px" className="tilt" />
          </div>
        </div>
      </section>
    );
  }
  const stepsOnly = body.every((b) => (b.t === "cards" && isStepCards(b, p.head.title)) || b.t === "steps" || PROSE.has(b.t));
  const slate = ctx.variant === "commercial" && stepsOnly && body.some((b) => b.t === "steps" || b.t === "cards");
  return (
    <section className={slate ? "sec slate on-dark" : tone} aria-labelledby={p.head.title ? `${id}-h` : undefined}>
      <div className="wrap stack-lg">
        {p.head.title || p.head.eyebrow ? (
          <div className="sec-head">
            <div className="stack-sm">
              <HeadView head={p.head} id={`${id}-h`} />
            </div>
            {introP ? <p className="muted">{renderInline(introP.c, `${id}-intro`)}</p> : null}
          </div>
        ) : introP ? (
          <p className="muted content-col">{renderInline(introP.c, `${id}-intro`)}</p>
        ) : null}
        {groupProse(body).map((g, k) =>
          Array.isArray(g) ? (
            <div key={k} className="stack content-col">
              <Prose blocks={g} ctx={ctx} idx={`${id}g${k}`} />
            </div>
          ) : (
            <Special key={k} b={g} ctx={ctx} idx={`${id}x${k}`} title={p.head.title} />
          ),
        )}
      </div>
    </section>
  );
}

/** Content that needs the full width (grids, galleries, steps…). */
const isWide = (blocks: Block[]) =>
  blocks.some((b) => b.t === "gallery" || b.t === "steps" || b.t === "stats" || b.t === "marquee" || b.t === "faq" || b.t === "reviews" || (b.t === "cards" && b.items.length > 3) || townList(b));

const blockLen = (b: Block): number => (b.t === "p" ? inlinePlain(b.c).length : b.t === "ul" || b.t === "ol" ? b.items.reduce((n, it) => n + inlinePlain(it).length, 0) : b.t === "h" ? b.text.length : 40);

/** Consecutive prose blocks grouped, special blocks on their own. */
function groupProse(blocks: Block[]): (Block[] | Block)[] {
  const out: (Block[] | Block)[] = [];
  for (const b of blocks) {
    if (PROSE.has(b.t) && !townList(b)) {
      const last = out[out.length - 1];
      if (Array.isArray(last)) last.push(b);
      else out.push([b]);
    } else out.push(b);
  }
  return out;
}

/* ───────────── hero ───────────── */

function Hero({ n, ctx, crumbs, image, formService, price, formHero }: { n: ReturnType<typeof normalize>; ctx: Ctx; crumbs: { label: string; href: string }[]; image: ImageT; formService?: string; price?: string; formHero: boolean }) {
  const ctas = n.ctas.length ? n.ctas : [{ label: "Get a free quote", href: "/contact/" }];
  const primary = ctas.find((c) => !c.href.startsWith("tel:")) ?? { label: "Get a free quote", href: "/contact/" };
  const extra = ctas.filter((c) => c !== primary && !c.href.startsWith("tel:"));
  if (formHero) {
    return (
      <section className="hero-home hero-ads">
        <div className="bg parallax">
          <Image src={image.src} alt={image.alt} fill sizes="100vw" quality={55} preload fetchPriority="high" className="object-cover" />
        </div>
        <div className="wrap">
          <div className="stack-lg">
            {ctx.variant !== "ads" ? <Breadcrumbs crumbs={crumbs} /> : null}
            {n.eyebrow ? (
              <div className="pill-row intro" style={{ "--d": "0ms" } as React.CSSProperties}>
                <span className="gpill">{n.eyebrow}</span>
              </div>
            ) : (
              <div className="pill-row intro" style={{ "--d": "0ms" } as React.CSSProperties}>
                <span className="gpill">
                  <Icon name="star" /> {site.rating.display} rating · {site.rating.countDisplay}+ Google reviews
                </span>
                <span className="gpill">
                  <Icon name="clock" /> Same-day pickup
                </span>
              </div>
            )}
            <h1 className="d1">
              <WordReveal text={n.h1} />
            </h1>
            {n.lead.map((l, k) => (
              <p key={k} className={k === 0 ? "lead intro" : "intro"} style={{ "--d": `${450 + k * 80}ms` } as React.CSSProperties}>
                {renderInline(l, `lead${k}`)}
              </p>
            ))}
            {n.trust.length ? (
              <ul className="ticks intro" style={{ "--d": "560ms" } as React.CSSProperties}>
                {n.trust.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            ) : null}
            <div className="btn-row intro" style={{ "--d": "600ms" } as React.CSSProperties}>
              <Link className="btn btn-primary" href={ctx.formAnchor}>
                {primary.label}
              </Link>
              <a className="btn btn-ghost btn-glass" href={`tel:${site.phone.tel}`} data-track="phone">
                <Icon name="phone" /> {site.phone.display}
              </a>
            </div>
          </div>
          <div className="qcard qcard-form intro" style={{ "--d": "700ms" } as React.CSSProperties}>
            <QuoteForm compact formType={ctx.variant === "ads" ? "landing" : "quote"} service={formService} />
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="hero">
      <div className="wrap">
        <div className="stack-lg">
          <Breadcrumbs crumbs={crumbs} />
          {n.eyebrow ? <p className="eyebrow">{n.eyebrow}</p> : null}
          <h1 className={n.h1.length > 44 ? "d1 mt-0 d1-long" : "d1 mt-0"}>
            <WordReveal text={n.h1} />
          </h1>
          {n.lead.map((l, k) => (
            <p key={k} className={k === 0 ? "lead" : "muted"}>
              {renderInline(l, `lead${k}`)}
            </p>
          ))}
          {n.trust.length ? (
            <ul className="ticks">
              {n.trust.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          ) : null}
          <div className="btn-row">
            <Link className="btn btn-primary" href={ctx.formAnchor}>
              {primary.label}
            </Link>
            <a className="btn btn-ghost" href={`tel:${site.phone.tel}`} data-track="phone">
              <Icon name="phone" /> {site.phone.display}
            </a>
          </div>
          {extra.length ? <Buttons items={extra} ctx={ctx} /> : null}
          <Rating />
          {price ? (
            <div className="callout small">
              <b>{price}</b>
            </div>
          ) : null}
        </div>
        <Cover image={image} sizes="(max-width: 960px) 100vw, 600px" priority />
      </div>
    </section>
  );
}

/* ───────────── page ───────────── */

export type AutoPageProps = {
  doc: PageDoc;
  variant: Variant;
  calm?: boolean;
  formService?: string;
  jsonLd?: object;
  summary?: string[];
  price?: string;
  /** Extra sections before the closing band (town services, hub children…). */
  after?: ReactNode;
  related?: { title: string; links: { label: string; href: string }[] }[];
  /** Paid-traffic pages: the quote form sits in the hero, above the fold on every screen. */
  formHero?: boolean;
  /** Content right under the hero (category pages: the category's services). */
  afterHero?: ReactNode;
};

export { iconFor };

export function AutoPage({ doc, variant, calm, formService, jsonLd, summary, price, after, afterHero, related = [], formHero = variant === "ads" }: AutoPageProps) {
  const n = normalize(doc);
  const ctx: Ctx = { variant, formAnchor: "#quote-form" };
  const crumbs = breadcrumbs(doc);
  const heroImage = n.heroImage ?? { src: IMG[FALLBACK[variant]], alt: `Live Junk Free crew — ${doc.h1}` };
  // Photos for text-only sections: the page's own unused photos, every other section.
  // Photos of wide sections can't sit beside the content: they go to the pool for other sections.
  for (const p of n.parts) {
    if (p.image && !p.blocks.every((b) => PROSE.has(b.t)) && isWide(p.blocks)) {
      n.pool.push(p.image);
      p.image = undefined;
    }
  }
  const pool = [...n.pool];
  let textOnly = 0;
  let crewUsed = 0;
  const seed = [...doc.path].reduce((a, c) => a + c.charCodeAt(0), 0);
  const shown = new Set<string>(
    [n.heroImage?.src, ...n.parts.map((p) => p.image?.src), ...n.parts.flatMap((p) => p.blocks.flatMap((b) => (b.t === "img" ? [b.image.src] : b.t === "gallery" ? b.images.map((x) => x.src) : [])))].filter(
      (x): x is string => !!x,
    ),
  );
  if (!n.heroImage) shown.add(IMG[FALLBACK[variant]]);
  const photos = n.parts.map((p) => {
    if (p.image && widthOf(p.image) < 560) {
      pool.push(p.image);
      p.image = undefined;
    }
    if (p.image || !p.blocks.every((b) => PROSE.has(b.t))) return undefined;
    const [, subs] = subsections(p.blocks);
    if (subs.length >= 2) return undefined;
    if (textOnly++ % 2) return undefined;
    const k = pool.findIndex((im) => widthOf(im) >= 560);
    if (k !== -1) return pool.splice(k, 1)[0];
    // No photos of its own left: one of the crew photos from livejunkfree.ca, every 4th text section.
    if ((textOnly - 1) % 4) return undefined;
    // Never a crew photo the page already shows (hero, a section, or an earlier pick).
    for (let tries = 0; tries < CREW.length; tries++) {
      const key = CREW[(seed + crewUsed++) % CREW.length];
      if (key === FALLBACK[variant] && !n.heroImage) continue;
      if (shown.has(IMG[key])) continue;
      shown.add(IMG[key]);
      return { src: IMG[key], alt: CREW_ALT[key] ?? "Live Junk Free crew" };
    }
    return undefined;
  });
  const leftover = pool;
  // Running index of text-only sections (no photo, no sub-panels) → their design rotates.
  const textIdx: number[] = [];
  for (let i = 0, run = 0; i < n.parts.length; i++) {
    const p = n.parts[i];
    const plain = !p.group && !p.image && !photos[i] && p.blocks.every((b) => PROSE.has(b.t)) && subsections(p.blocks)[1].length < 2;
    textIdx.push(plain ? run : 0);
    run = plain ? run + 1 : 0;
  }
  const titles = new Set(n.parts.map((p) => p.head.title?.trim().toLowerCase()).filter(Boolean));
  const bandOwn = n.quote.title && !titles.has(n.quote.title.trim().toLowerCase());
  const band = { h: bandOwn ? n.quote.title! : CTA_DEFAULT.h, p: bandOwn ? (n.quote.text ?? CTA_DEFAULT.p) : CTA_DEFAULT.p };
  related = related.filter((r) => !titles.has(r.title.trim().toLowerCase()) && !(r.title.toLowerCase().includes("areas") && n.parts.some((p) => p.blocks.some((b) => townList(b)))));
  return (
    <PageShell calm={calm} minimal={variant === "ads"} quoteHref="#quote-form">
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <Hero n={n} ctx={ctx} crumbs={crumbs} image={heroImage} formService={formService} price={price} formHero={formHero} />
      {n.stats ? (
        <section className="sec tight white">
          <div className="wrap">
            <StatsGrid items={n.stats.items} />
          </div>
        </section>
      ) : null}
      {afterHero}
      {summary?.length ? <SummaryBox sentences={summary} /> : null}
      {n.parts.map((p, i) => (
        <PartView key={i} p={p} i={i} ctx={ctx} photo={photos[i]} textIdx={textIdx[i]} />
      ))}
      {leftover.length >= 2 ? (
        <section className={n.parts.length % 2 === 0 ? "sec white" : "sec"}>
          <div className="wrap">
            <Mosaic images={leftover.slice(0, 6)} />
          </div>
        </section>
      ) : null}
      {after}
      {related.length ? (
        <section className="sec white tight">
          <div className={related.length > 1 ? "wrap grid g2" : "wrap"}>
            {related.map((r) => (
              <div key={r.title} className="stack">
                <h2 className="h4">{r.title}</h2>
                <div className="flex flex-wrap gap-2">
                  {r.links.map((l) => (
                    <Link key={l.href} className="chip" href={l.href}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <section className="cta-band on-dark" id="quote">
        <div className="wrap">
          <div className="stack-lg">
            <h2 className="d2">{band.h}</h2>
            <p className="lead">{band.p}</p>
            <div>
              <p className="muted small">{CTA_DEFAULT.callLabel}</p>
              <a className="callbig" href={`tel:${site.phone.tel}`} data-track="phone">
                {site.phone.display}
              </a>
            </div>
            <ul className="ticks">
              {CTA_DEFAULT.ticks.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <Rating />
          </div>
          <div className="formbox">
            {formHero ? (
              <QuoteForm title="Request your free quote" formType={variant === "ads" ? "landing" : "quote"} service={formService} id="quote-form-2" />
            ) : (
              <QuoteForm title="Request your free quote" service={formService} />
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
