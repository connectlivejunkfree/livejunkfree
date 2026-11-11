"use client";

/**
 * Blog post grid with category chips and search (client-side). The current
 * page's 12 posts are server-rendered, so they're crawlable without JS;
 * searching or filtering switches to the full list.
 * Data: post cards built from content/blog/*.json by the BlogIndex template.
 */
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export type PostCard = {
  href: string;
  title: string;
  excerpt: string;
  date: string;
  dateLabel: string;
  minutes: number;
  categories: string[];
  image?: { src: string; alt: string; width: number; height: number };
};

export function BlogBrowser({ cards, page, perPage, bare = false, feature = false }: { cards: PostCard[]; page: number; perPage: number; bare?: boolean; feature?: boolean }) {
  const [q, setQ] = useState(() => (typeof window === "undefined" ? "" : (new URLSearchParams(window.location.search).get("q") ?? "")));
  const [cat, setCat] = useState("All");
  const cats = useMemo(() => ["All", ...new Set(cards.flatMap((c) => c.categories))], [cards]);
  const filtering = q.trim() !== "" || cat !== "All";
  const list = filtering
    ? cards.filter((c) => (cat === "All" || c.categories.includes(cat)) && (!q.trim() || `${c.title} ${c.excerpt}`.toLowerCase().includes(q.trim().toLowerCase())))
    : cards.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      {bare ? null : (
        <div className="blog-tools">
          <div className="filterbox">
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the blog…" aria-label="Search blog posts" aria-controls="post-grid" />
          </div>
          {cats.length > 2 ? (
            <div className="chips" role="group" aria-label="Filter by category">
              {cats.map((c) => (
                <button key={c} type="button" className={c === cat ? "chip on" : "chip"} aria-pressed={c === cat} onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
      <ul className="posts" id="post-grid" aria-live={filtering ? "polite" : undefined}>
        {list.map((c, i) => {
          const tag = c.categories.find((x) => x.toLowerCase() !== "blog");
          const feat = feature && !filtering && i === 0;
          return (
            <li key={c.href} className={feat ? "feat" : undefined}>
              <Link href={c.href} className="post">
                <span className="post-thumb">
                  {c.image ? (
                    <Image src={c.image.src} alt={c.image.alt} width={c.image.width} height={c.image.height} sizes={feat ? "(max-width: 960px) 100vw, 700px" : "(max-width: 760px) 100vw, 400px"} priority={feat} />
                  ) : (
                    <span className="post-ph" aria-hidden="true" />
                  )}
                  {feat ? <span className="post-badge">Latest</span> : tag ? <span className="post-badge soft">{tag}</span> : null}
                </span>
                <span className="post-text">
                  <time dateTime={c.date}>
                    {c.dateLabel} · {c.minutes} min read
                  </time>
                  <span className={feat ? "d3" : "h4"}>{c.title}</span>
                  <span className="small muted post-ex">{c.excerpt.replace(/\s*\[(…|&hellip;|\.\.\.)\]\s*$/, "…")}</span>
                  <span className="post-go">
                    Read article <span aria-hidden="true">→</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {filtering && !list.length ? <p className="muted">No posts match your search.</p> : null}
    </>
  );
}
