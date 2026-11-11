/**
 * Template 9 — Blog.
 *   BlogIndex  /blog/ and /blog/page/<n>/ : all posts newest first, 12 per page
 *              (crawlable page links), category chips and client-side search.
 *   BlogPost   /blog/<slug>/ : featured image, reading time, table of contents
 *              (3+ H2s), the post, CTA, related posts, BlogPosting schema.
 * Content: content/blog/<slug>.json, content/pages/blog.json
 */
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { Icon } from "@/components/icons";
import { IMG } from "@content/designed/images";
import { CtaBand as DesignedCtaBand } from "@/components/designed/sections/CtaBand";
import { ArticleProgress } from "@/components/sections/ArticleProgress";
import { BlockView } from "@/components/sections/ContentSections";
import { inlinePlain, renderInline } from "@/components/ui/InlineText";
import { PageShell } from "@/components/layout/PageShell";
import { BlogBrowser, type PostCard } from "@/components/sections/BlogBrowser";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { blockText } from "@/lib/content/text";
import { blogPosts, imageSize, site, type Block, type BlockOf, type Inline, type PageDoc } from "@/lib/content";
import { isPhoto } from "@/components/designed/auto/normalize";

const CtaBand = DesignedCtaBand;
import { breadcrumbs } from "@/lib/content/page";
import { blogPostingNode, breadcrumbNode, graph } from "@/lib/seo/schema";

export const POSTS_PER_PAGE = 12;

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "America/Toronto" });
export const readingTime = (doc: PageDoc) => Math.max(1, Math.round(doc.sections.flatMap((s) => s.blocks).map(blockText).join(" ").split(/\s+/).length / 220));

export function postCards(): PostCard[] {
  return blogPosts().map((p) => ({
    href: p.path,
    title: p.doc.title,
    excerpt: p.doc.excerpt ?? "",
    date: p.doc.published,
    dateLabel: fmtDate(p.doc.published),
    minutes: readingTime(p.doc),
    categories: p.doc.categories ?? [],
    image: p.doc.featuredImage ? { ...p.doc.featuredImage, ...(imageSize(p.doc.featuredImage.src) ?? { width: 1200, height: 675 }) } : undefined,
  }));
}

export function BlogIndex({ doc, page = 1 }: { doc: PageDoc; page?: number }) {
  const crumbs = breadcrumbs(doc);
  const cards = postCards();
  const pages = Math.ceil(cards.length / POSTS_PER_PAGE);
  return (
    <PageShell>
      <JsonLd data={graph(breadcrumbNode(page > 1 ? [...crumbs, { label: `Page ${page}`, href: `/blog/page/${page}/` }] : crumbs))} />
      <header className="blog-hero">
        <div className="wrap stack">
          <Breadcrumbs crumbs={crumbs} />
          <p className="eyebrow">The Live Junk Free blog</p>
          <h1 className="d1">{doc.h1 || "Blog"}</h1>
          <p className="lead">
            {cards.length} guides on junk removal, cleanouts, costs and what to do with the stuff you no longer need, from the crew that hauls it every day.
          </p>
        </div>
      </header>
      <section className="sec white blog-list">
        <div className="wrap">
          <BlogBrowser cards={cards} page={page} perPage={POSTS_PER_PAGE} feature={page === 1} />
          <nav className="pager" aria-label="Blog pages">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link key={n} href={n === 1 ? "/blog/" : `/blog/page/${n}/`} aria-current={n === page ? "page" : undefined} className={n === page ? "on" : undefined}>
                {n}
              </Link>
            ))}
          </nav>
        </div>
      </section>
      <CtaBand form={{ title: "Request your free quote" }} />
    </PageShell>
  );
}

/**
 * Old page-builder quirks in posts:
 *  - a numbered step on its own with its text as the next (heading) block → one step with text,
 *    and consecutive single steps become one steps list;
 *  - a "heading" that is really a sentence (over 100 characters) → a paragraph.
 */
function tidyBlocks(bs: Block[]): Block[] {
  const out: Block[] = [];
  for (let i = 0; i < bs.length; i++) {
    const b = bs[i];
    if (b.t === "steps" && b.items.length === 1 && !b.items[0].text.length) {
      const next = bs[i + 1];
      const text: Inline[][] = next?.t === "h" && next.l >= 3 ? [[next.text]] : next?.t === "p" ? [next.c] : [];
      if (text.length) i++;
      const item = { ...b.items[0], text };
      const prev = out[out.length - 1];
      if (prev?.t === "steps") prev.items.push(item);
      else out.push({ t: "steps", items: [item] });
      continue;
    }
    if (b.t === "h" && b.l >= 3 && b.text.length > 100) {
      out.push({ t: "p", c: [b.text] });
      continue;
    }
    out.push(b);
  }
  return out;
}

/** Same photo, ignoring WordPress size copies (-1024x683, -scaled). */
const imgBase = (src = "") => src.replace(/-\d+x\d+(?=\.\w+$)/, "").replace(/-scaled(?=\.\w+$)/, "");
const sameImg = (a: string, b?: string) => !!b && imgBase(a) === imgBase(b);

/** "1. You Can't Use Rooms…" → number badge + title. */
const numbered = (t: string) => {
  const m = t.match(/^\s*(\d{1,2})[.)]\s+(.+)$/);
  return m ? { n: m[1], text: m[2] } : { n: undefined, text: t };
};

export function BlogPost({ doc }: { doc: PageDoc }) {
  const crumbs = breadcrumbs(doc);
  const related = postCards()
    .filter((c) => c.href !== doc.path)
    .sort((a, b) => Number(b.categories.some((c) => doc.categories?.includes(c))) - Number(a.categories.some((c) => doc.categories?.includes(c))))
    .slice(0, 3);
  const img = doc.featuredImage;
  const size = img ? (imageSize(img.src) ?? { width: 1200, height: 675 }) : null;
  // Same rule as every other page: real photos only, never the old site's PNG graphics, icons or badges.
  const rawBlocks = doc.sections
    .flatMap((s) => s.blocks)
    .filter((b) => !(b.t === "h" && b.l === 1) && !(b.t === "img" && (!isPhoto(b.image) || sameImg(b.image.src, doc.featuredImage?.src))))
    .map((b): Block =>
      b.t === "cards"
        ? { ...b, items: b.items.map((c) => (c.image && !isPhoto(c.image) ? { ...c, image: undefined } : c)) }
        : b.t === "gallery"
          ? { ...b, images: b.images.filter(isPhoto) }
          : b,
    )
    .filter((b) => !(b.t === "gallery" && !b.images.length));
  const blocks = tidyBlocks(rawBlocks);
  const h2s = blocks.filter((b): b is BlockOf<"h"> => b.t === "h" && b.l === 2);
  const tags = (doc.categories ?? []).filter((c) => c.toLowerCase() !== "blog");
  const midAfter = h2s.length >= 4 ? h2s[Math.floor(h2s.length / 2)] : undefined; // the mid-article CTA goes before this H2
  const leadIdx = blocks.findIndex((b) => b.t === "p");
  const body = blocks.map((b, i) => {
    if (b.t === "h" && b.l === 2) {
      const h2i = h2s.indexOf(b);
      const { n, text } = numbered(b.text);
      return (
        <Fragment key={i}>
          {b === midAfter ? <MidCta /> : null}
          <h2 id={`s${h2i}`} className={n ? "art-h2 has-n" : "art-h2"}>
            {n ? (
              <span className="art-n" aria-hidden="true">
                {n.padStart(2, "0")}
              </span>
            ) : null}
            <span>
              {n ? <span className="sr-only">{n}. </span> : null}
              {text}
            </span>
          </h2>
        </Fragment>
      );
    }
    if (b.t === "h" && b.l >= 3) return <h3 key={i} className="art-h3">{b.text}</h3>;
    if (b.t === "p" && i === leadIdx) {
      return (
        <p key={i} className="art-lead">
          {renderInline(b.c, `l${i}`)}
        </p>
      );
    }
    if (b.t === "p") {
      // "Time Efficiency and Expertise<br>Professional teams…": a short first line is the point's title.
      const br = b.c.findIndex((x) => typeof x === "object" && "br" in x);
      const first = br > 0 ? inlinePlain(b.c.slice(0, br)).trim() : "";
      if (first && first.length <= 70 && !/[.!?:]$/.test(first) && br < b.c.length - 1) {
        return (
          <p key={i} className="art-point">
            <b>{renderInline(b.c.slice(0, br), `t${i}`)}</b>
            {renderInline(b.c.slice(br + 1), `r${i}`)}
          </p>
        );
      }
    }
    if (b.t === "img") {
      const sz = imageSize(b.image.src);
      return (
        <figure key={i} className="art-fig">
          <Image src={b.image.src} alt={b.image.alt} width={sz?.width ?? 1200} height={sz?.height ?? 800} sizes="(max-width: 860px) 100vw, 720px" />
        </figure>
      );
    }
    return <BlockView key={i} b={b} idx={`b${i}`} />;
  });

  return (
    <PageShell>
      <JsonLd data={graph(breadcrumbNode(crumbs), blogPostingNode(doc))} />
      <ArticleProgress />
      <article>
        <header className="art-hero">
          <div className="wrap art-hero-grid">
            <div className="stack art-hero-copy">
              <Breadcrumbs crumbs={crumbs} />
              <div className="art-tags">
                {tags.map((t) => (
                  <span key={t} className="art-tag">
                    {t}
                  </span>
                ))}
                <span className="art-tag soft">
                  <Icon name="clock" /> {readingTime(doc)} min read
                </span>
              </div>
              <h1 className="d1 art-title">{doc.h1 || doc.title}</h1>
              <div className="art-by">
                <span className="art-av" aria-hidden="true">
                  <Icon name="truck" />
                </span>
                <span>
                  <b>Live Junk Free team</b>
                  <time dateTime={doc.published}>{fmtDate(doc.published)}</time>
                </span>
              </div>
            </div>
            {img && size ? (
              <figure className="art-cover">
                <Image src={img.src} alt={img.alt} width={size.width} height={size.height} sizes="(max-width: 960px) 100vw, 600px" preload fetchPriority="high" />
              </figure>
            ) : (
              // No cover on the old post: a real Live Junk Free crew photo instead of an empty frame.
              <figure className="art-cover">
                <Image src={IMG.crewAbout} alt="Live Junk Free crew member carrying boards to the truck" width={1280} height={854} sizes="(max-width: 960px) 100vw, 600px" preload fetchPriority="high" />
              </figure>
            )}
          </div>
        </header>
        <div className={h2s.length >= 3 ? "wrap art-grid" : "wrap art-grid no-toc"}>
          {h2s.length >= 3 ? (
            <aside className="art-side">
              <details className="art-toc" open>
                <summary>On this page</summary>
                <ol>
                  {h2s.map((h, i) => (
                    <li key={i}>
                      <a href={`#s${i}`}>{numbered(h.text).text}</a>
                    </li>
                  ))}
                </ol>
              </details>
              <div className="art-mini on-dark">
                <b>Need it gone?</b>
                <span>Free quote, same-day pickup when available.</span>
                <a className="btn btn-primary btn-sm" href={`tel:${site.phone.tel}`} data-track="phone">
                  <Icon name="phone" /> {site.phone.display}
                </a>
              </div>
            </aside>
          ) : null}
          <div className="art-body">
            {body}
            <div className="art-end">
              <Link href="/blog/" className="btn btn-ghost">
                ← All articles
              </Link>
            </div>
          </div>
        </div>
      </article>
      {related.length ? (
        <section className="sec">
          <div className="wrap stack-lg">
            <div className="sec-head">
              <div className="stack-sm">
                <p className="eyebrow">Keep reading</p>
                <h2 className="d2">More from the blog</h2>
              </div>
              <Link href="/blog/" className="btn btn-ghost">
                All articles <Icon name="arrow" />
              </Link>
            </div>
            <BlogBrowser cards={related} page={1} perPage={3} bare />
          </div>
        </section>
      ) : null}
      <CtaBand form={{ title: "Request your free quote" }} />
    </PageShell>
  );
}

/** Mid-article call to action: a dark card between two sections. */
function MidCta() {
  return (
    <aside className="art-cta on-dark" aria-label="Get a free quote">
      <span className="art-cta-ic" aria-hidden="true">
        <Icon name="truck" />
      </span>
      <div className="stack-sm">
        <b className="h4">Rather have it handled for you?</b>
        <span>Live Junk Free does the lifting, loading and sweep-up across Toronto and the GTA.</span>
      </div>
      <div className="btn-row">
        <Link className="btn btn-primary" href="/contact/">
          Get a free quote
        </Link>
        <a className="btn btn-glass" href={`tel:${site.phone.tel}`} data-track="phone">
          <Icon name="phone" /> {site.phone.display}
        </a>
      </div>
    </aside>
  );
}
