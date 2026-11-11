"use client";

/**
 * Blog post reading aids: a thin orange progress bar under the header, and the
 * table-of-contents link for the section being read gets `aria-current`.
 * Pure enhancement: without JS the article and its contents list work as plain links.
 */
import { useEffect, useRef } from "react";

export function ArticleProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const body = document.querySelector<HTMLElement>(".art-body");
    if (!body) return;
    // Phones: the contents list starts collapsed above the article.
    if (innerWidth < 961) document.querySelector(".art-toc")?.removeAttribute("open");
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = body.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
        if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });

    const links = new Map<string, HTMLAnchorElement>();
    document.querySelectorAll<HTMLAnchorElement>(".art-toc a[href^='#']").forEach((a) => links.set(a.hash.slice(1), a));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          links.forEach((a) => a.removeAttribute("aria-current"));
          links.get(e.target.id)?.setAttribute("aria-current", "true");
        }
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    links.forEach((_, id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);
  return (
    <div className="art-progress" aria-hidden="true">
      <div ref={bar} />
    </div>
  );
}
