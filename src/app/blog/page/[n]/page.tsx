/**
 * Blog pagination: /blog/page/2/, /blog/page/3/ … (12 posts per page, crawlable).
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts, getDoc } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { BlogIndex, POSTS_PER_PAGE } from "@/templates/Blog";

export const dynamicParams = false;

export function generateStaticParams() {
  const pages = Math.ceil(blogPosts().length / POSTS_PER_PAGE);
  return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ n: String(i + 2) }));
}

export async function generateMetadata({ params }: PageProps<"/blog/page/[n]">): Promise<Metadata> {
  const n = Number((await params).n);
  const doc = getDoc("/blog/")!;
  const base = pageMetadata(doc);
  return { ...base, title: { absolute: `${doc.seo.title} – Page ${n}` }, alternates: { canonical: `https://livejunkfree.ca/blog/page/${n}/` } };
}

export default async function BlogPage({ params }: PageProps<"/blog/page/[n]">) {
  const n = Number((await params).n);
  const doc = getDoc("/blog/");
  if (!doc || !Number.isInteger(n) || n < 2) notFound();
  return <BlogIndex doc={doc} page={n} />;
}
