/**
 * Every page on the site. Thin route: loads the content file for the URL and
 * hands it to its template — or, for the client-approved demo pages
 * (src/components/designed), renders the approved design. Static (SSG) for every URL built in this phase;
 * URLs from later phases are served by the old site via src/proxy.ts.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { builtRows, getDoc, manifestRow } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { designedPage } from "@/components/designed";
import { PageTemplate } from "@/templates";

export const dynamicParams = false;

const toPath = (slug?: string[]) => (slug?.length ? `/${slug.join("/")}/` : "/");

export function generateStaticParams() {
  return builtRows().map((r) => ({ slug: r.path === "/" ? [] : r.path.split("/").filter(Boolean) }));
}

export async function generateMetadata({ params }: PageProps<"/[[...slug]]">): Promise<Metadata> {
  const path = toPath((await params).slug);
  const doc = getDoc(path);
  if (!doc) return {};
  const row = manifestRow(path);
  return pageMetadata(doc, { noindex: doc.type === "thank-you", town: row?.town });
}

export default async function Page({ params }: PageProps<"/[[...slug]]">) {
  const path = toPath((await params).slug);
  const doc = getDoc(path);
  if (!doc) notFound();
  // Client-approved demo pages win for their URLs (metadata above still comes from the live site).
  return designedPage(path) ?? <PageTemplate doc={doc} />;
}
