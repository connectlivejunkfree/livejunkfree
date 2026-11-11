import type { Metadata } from "next";
import { REVIEW_MODE } from "@content/designed/site";

/** Per-page metadata: title, description, canonical. `noindex` forces noindex (landing pages). */
export function pageMeta({ title, description, path, noindex }: { title: string; description: string; path: string; noindex?: boolean }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
    robots: REVIEW_MODE || noindex ? { index: false, follow: !REVIEW_MODE } : undefined,
  };
}
