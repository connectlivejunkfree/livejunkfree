/**
 * Renders a page's content sections in their original order, mapping each
 * content block to a design component. Used by every page template.
 *
 * Content fields used: doc.sections[].blocks[] (see src/lib/content/schema.ts).
 * Layout rules:
 *   - a section's leading eyebrow + H2 (+ one short intro paragraph) becomes the section head
 *   - a section with exactly one image and other content becomes a two-column split
 *   - sections alternate white / soft backgrounds for rhythm
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { liveHref, site, type Block, type BlockOf, type Section } from "@/lib/content";
import { Icon } from "../icons";
import { inlinePlain, renderInline } from "../ui/InlineText";
import { Photo } from "../ui/Photo";
import { Stars } from "../ui/Stars";
import { MapEmbed } from "./Areas";
import { BeforeAfter } from "./BeforeAfter";
import { Faq, Steps } from "./Blocks";
import { QuoteForm } from "../forms/QuoteForm";
import { Reviews } from "./Reviews";
import { StatsGrid } from "./StatsGrid";
import { ItemMarquee } from "./Strips";

const townBySlugOrName = new Map(site.towns.flatMap((t) => [[t.name.toLowerCase(), t], [t.slug, t]]));
const plainItem = (item: BlockOf<"ul">["items"][number]) => (item.length === 1 && typeof item[0] === "string" ? item[0].trim() : null);

/** A list whose items are all GTA town names → linked area chips. */
function townList(b: BlockOf<"ul">) {
  const names = b.items.map(plainItem);
  if (names.length < 4 || names.some((n) => !n)) return null;
  const matched = names.filter((n) => townBySlugOrName.has(n!.toLowerCase()) || n === "Stouffville");
  return matched.length >= names.length - 1 ? (names as string[]) : null;
}

function Heading({ b }: { b: BlockOf<"h"> }) {
  if (b.l === 1) return <h1 className="d1">{b.text}</h1>;
  if (b.l === 2) return <h2 className="d2">{b.text}</h2>;
  if (b.l === 3) return <h3 className="d3">{b.text}</h3>;
  return <h4 className="h4">{b.text}</h4>;
}

function Cards({ b }: { b: BlockOf<"cards"> }) {
  const titlesOnly = b.items.every((c) => !c.text && !c.image);
  if (titlesOnly) {
    return (
      <ul className="ticks two">
        {b.items.map((c) => (
          <li key={c.title}>{c.href && liveHref(c.href)?.startsWith("/") ? <Link href={c.href}>{c.title}</Link> : c.title}</li>
        ))}
      </ul>
    );
  }
  const cols = b.items.length % 3 === 0 ? "g3" : b.items.length === 4 ? "g4" : "g2";
  return (
    <div className={`grid ${cols} cards`}>
      {b.items.map((c, i) => {
        const inner = (
          <>
            {c.image ? <Photo image={c.image} sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 400px" className="card-photo" /> : null}
            <div className="card-body">
              <h3 className="h4">{c.title}</h3>
              {c.text ? <p className="small muted">{c.href && liveHref(c.href)?.startsWith("/") ? inlinePlain(c.text) : renderInline(c.text, `card${i}`)}</p> : null}
            </div>
          </>
        );
        const href = c.href ? liveHref(c.href) : null;
        return href && href.startsWith("/") ? (
          <Link key={c.title + i} href={href} className="panel card link-card">
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

function Ctas({ b, formAnchor }: { b: BlockOf<"ctas">; formAnchor?: string }) {
  return (
    <div className="btn-row">
      {b.items.map((c, i) => {
        if (c.href.startsWith("tel:")) {
          return (
            <a key={c.label + i} className="btn btn-dark" href={`tel:${site.phone.tel}`} data-track="phone">
              <Icon name="phone" /> {c.label}
            </a>
          );
        }
        // On pages with a quote form, "Get a quote"-style buttons scroll to it.
        const toForm = formAnchor && (c.href === "/contact/" || !c.href);
        const href = toForm ? formAnchor! : (c.href && liveHref(c.href)) || "/contact/";
        const cls = i === 0 ? "btn btn-primary" : "btn btn-ghost";
        return href.startsWith("/") ? (
          <Link key={c.label + i} className={cls} href={href}>
            {c.label}
          </Link>
        ) : (
          <a key={c.label + i} className={cls} href={href}>
            {c.label}
          </a>
        );
      })}
    </div>
  );
}

function Gallery({ b }: { b: BlockOf<"gallery"> }) {
  const imgs = b.images;
  const before = imgs.find((i) => /before/i.test(i.src + i.alt));
  const after = imgs.find((i) => i !== before && /after/i.test(i.src + i.alt));
  if (imgs.length === 2 && before && after) return <BeforeAfter before={before} after={after} />;
  return (
    <div className={`grid ${imgs.length >= 3 ? "g3" : "g2"} gallery`}>
      {imgs.map((im) => (
        <Photo key={im.src} image={im} sizes="(max-width: 640px) 100vw, 400px" />
      ))}
    </div>
  );
}

export function BlockView({ b, idx, formAnchor }: { b: Block; idx: string; formAnchor?: string }): ReactNode {
  switch (b.t) {
    case "eyebrow":
      return <p className="eyebrow">{b.text}</p>;
    case "h":
      return <Heading b={b} />;
    case "p":
      return <p className="prose-p">{renderInline(b.c, idx)}</p>;
    case "ul": {
      const towns = townList(b);
      if (towns) {
        return (
          <ul className="areas">
            {towns.map((name) => {
              const t = townBySlugOrName.get(name.toLowerCase()) ?? (name === "Stouffville" ? townBySlugOrName.get("whitchurch-stouffville") : undefined);
              return <li key={name}>{t ? <Link href={`/locations/${t.slug}/`}>{name}</Link> : <span>{name}</span>}</li>;
            })}
          </ul>
        );
      }
      const short = b.items.length >= 4 && b.items.every((it) => (plainItem(it) ?? "x".repeat(99)).length < 48);
      return (
        <ul className={short ? "ticks two" : "ticks"}>
          {b.items.map((it, i) => (
            <li key={i}>{renderInline(it, `${idx}-${i}`)}</li>
          ))}
        </ul>
      );
    }
    case "ol":
      return (
        <ol className="olist">
          {b.items.map((it, i) => (
            <li key={i}>{renderInline(it, `${idx}-${i}`)}</li>
          ))}
        </ol>
      );
    case "steps":
      return <Steps list={b.items.map((s) => ({ n: s.n, title: s.title, text: s.text }))} />;
    case "cards":
      return <Cards b={b} />;
    case "checks":
      return (
        <ul className="checks">
          {b.items.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      );
    case "ctas":
      return <Ctas b={b} formAnchor={formAnchor} />;
    case "price":
      return (
        <div className="price-card">
          {b.label ? <span className="price-label">{b.label}</span> : null}
          <span className="price-value">{renderInline([b.value], idx)}</span>
        </div>
      );
    case "faq":
      return <Faq items={b.items} />;
    case "img":
      return <Photo image={b.image} sizes="(max-width: 960px) 100vw, 600px" />;
    case "gallery":
      return <Gallery b={b} />;
    case "stats":
      return <StatsGrid items={b.items} />;
    case "reviews":
      return <Reviews />;
    case "form":
      return <QuoteForm title={b.name === "New Form" ? undefined : b.name} id={`quote-form-${idx}`} />;
    case "map":
      return <MapEmbed className="min-h-[320px]!" />;
    case "marquee":
      return <ItemMarquee items={b.items} />;
    case "video":
      return (
        <video className="video" src={b.src} muted loop playsInline autoPlay preload="none" aria-hidden="true">
          <track kind="captions" />
        </video>
      );
    case "rating":
      return <Stars n={Math.round(b.value)} />;
  }
}

function SectionView({ s, i, formAnchor }: { s: Section; i: number; formAnchor?: string }) {
  const blocks = [...s.blocks];
  // Section head: eyebrow? + H2 (+ one short intro paragraph).
  const head: Block[] = [];
  if (blocks[0]?.t === "eyebrow" && blocks[1]?.t === "h") head.push(blocks.shift()!, blocks.shift()!);
  else if (blocks[0]?.t === "h" && blocks[0].l <= 2) head.push(blocks.shift()!);
  const images = blocks.filter((b) => b.t === "img");
  const split = images.length === 1 && blocks.length > 1 && !blocks.some((b) => b.t === "gallery" || b.t === "faq" || b.t === "reviews" || b.t === "steps");
  const fullWidth = blocks.some((b) => b.t === "reviews" || b.t === "marquee");
  const tone = i % 2 === 1 ? "soft" : "white";
  const id = `s${i}`;

  const body = split ? (
    <div className={`split-media ${i % 4 === 3 ? "flip" : ""}`}>
      <div className="stack">
        {blocks.filter((b) => b.t !== "img").map((b, k) => (
          <BlockView key={k} b={b} idx={`${id}-${k}`} formAnchor={formAnchor} />
        ))}
      </div>
      <BlockView b={images[0]} idx={`${id}-img`} />
    </div>
  ) : (
    <div className={fullWidth ? "stack" : "stack content-col"}>
      {blocks.map((b, k) => (
        <BlockView key={k} b={b} idx={`${id}-${k}`} formAnchor={formAnchor} />
      ))}
    </div>
  );

  return (
    <section className={`sec ${tone}`} aria-labelledby={head.length ? `${id}-h` : undefined}>
      <div className="wrap">
        {head.length ? (
          <div className="sec-head stack-sm">
            {head.map((b, k) =>
              b.t === "eyebrow" ? (
                <p key={k} className="eyebrow">
                  {b.text}
                </p>
              ) : b.t === "h" ? (
                <h2 key={k} id={`${id}-h`} className="d2">
                  {b.text}
                </h2>
              ) : null,
            )}
          </div>
        ) : null}
        {body}
      </div>
    </section>
  );
}

export function ContentSections({ sections, formAnchor, startIndex = 0, article = false }: { sections: Section[]; formAnchor?: string; startIndex?: number; article?: boolean }) {
  if (article) {
    // Blog posts: one continuous article; H2s get ids (#s0, #s1…) for the table of contents.
    let h2 = 0;
    return (
      <div className="article">
        {sections.flatMap((s, i) =>
          s.blocks.map((b, k) =>
            b.t === "h" && b.l === 2 ? (
              <h2 key={`${i}-${k}`} id={`s${h2++}`} className="d3">
                {b.text}
              </h2>
            ) : (
              <BlockView key={`${i}-${k}`} b={b} idx={`a${i}-${k}`} />
            ),
          ),
        )}
      </div>
    );
  }
  return (
    <>
      {sections.map((s, i) => (
        <SectionView key={i} s={s} i={i + startIndex} formAnchor={formAnchor} />
      ))}
    </>
  );
}
