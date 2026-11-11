/**
 * Content schema (zod). Every file in content/pages/** and content/blog/** is
 * validated against this when the site builds, so a hand-edit that breaks the
 * shape fails the build with a clear message instead of a broken page.
 *
 * Inline text is a small tree:
 *   string | { b: Inline[] } | { i: Inline[] } | { a: href, c: Inline[] } | { br: 1 }
 * Prices inside text are tokens like {{cad_125}} resolved from content/pricing.json.
 */
import { z } from "zod";

export type Inline = string | { b: Inline[] } | { i: Inline[] } | { a: string; c: Inline[] } | { br: 1 };

export const InlineSchema: z.ZodType<Inline> = z.lazy(() =>
  z.union([
    z.string(),
    z.object({ b: z.array(InlineSchema) }),
    z.object({ i: z.array(InlineSchema) }),
    z.object({ a: z.string(), c: z.array(InlineSchema) }),
    z.object({ br: z.literal(1) }),
  ]),
);
const Inlines = z.array(InlineSchema);

export const ImageSchema = z.object({ src: z.string(), alt: z.string(), width: z.number().optional(), height: z.number().optional() });
export type Image = z.infer<typeof ImageSchema>;

export const BlockSchema = z.discriminatedUnion("t", [
  z.object({ t: z.literal("eyebrow"), text: z.string() }),
  z.object({ t: z.literal("h"), l: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]), text: z.string() }),
  z.object({ t: z.literal("p"), c: Inlines }),
  z.object({ t: z.literal("ul"), items: z.array(Inlines) }),
  z.object({ t: z.literal("ol"), items: z.array(Inlines) }),
  z.object({ t: z.literal("steps"), items: z.array(z.object({ n: z.string(), title: z.string(), text: z.array(Inlines) })) }),
  z.object({
    t: z.literal("cards"),
    items: z.array(z.object({ title: z.string(), text: Inlines.optional(), image: ImageSchema.optional(), href: z.string().optional() })),
  }),
  z.object({ t: z.literal("checks"), items: z.array(z.string()) }),
  z.object({ t: z.literal("ctas"), items: z.array(z.object({ label: z.string(), href: z.string() })) }),
  z.object({ t: z.literal("price"), label: z.string().optional(), value: z.string() }),
  z.object({ t: z.literal("faq"), items: z.array(z.object({ q: z.string(), a: z.array(Inlines) })) }),
  z.object({ t: z.literal("img"), image: ImageSchema }),
  z.object({ t: z.literal("gallery"), images: z.array(ImageSchema) }),
  z.object({ t: z.literal("stats"), items: z.array(z.object({ label: z.string(), value: z.string() })) }),
  z.object({ t: z.literal("reviews") }),
  z.object({ t: z.literal("form"), name: z.string() }),
  z.object({ t: z.literal("map") }),
  z.object({ t: z.literal("marquee"), items: z.array(z.string()) }),
  z.object({ t: z.literal("video"), src: z.string() }),
  z.object({ t: z.literal("rating"), value: z.number() }),
]);
export type Block = z.infer<typeof BlockSchema>;
export type BlockOf<T extends Block["t"]> = Extract<Block, { t: T }>;

export const SectionSchema = z.object({ blocks: z.array(BlockSchema) });
export type Section = z.infer<typeof SectionSchema>;

export const TEMPLATES = [
  "Core", "BlogIndex", "BlogPost", "ItemRemoval", "Cleanout", "Commercial", "Demolition", "ServiceHub",
  "TownHub", "LocationService", "AdsLanding", "ThankYou", "Legal", "None",
] as const;
export type TemplateName = (typeof TEMPLATES)[number];

export const PageDocSchema = z.object({
  id: z.number(),
  kind: z.enum(["page", "post"]),
  path: z.string().startsWith("/").endsWith("/"),
  type: z.string(),
  template: z.enum(TEMPLATES),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    canonical: z.string(),
    robots: z.string(),
    ogImage: z.string().optional(),
  }),
  title: z.string(),
  h1: z.string(),
  published: z.string(),
  modified: z.string(),
  excerpt: z.string().optional(),
  categories: z.array(z.string()).optional(),
  featuredImage: ImageSchema.optional(),
  sections: z.array(SectionSchema),
});
export type PageDoc = z.infer<typeof PageDocSchema>;

export type ManifestRow = {
  path: string;
  id: number;
  kind: "page" | "post";
  type: string;
  template: TemplateName;
  file: string;
  parent: string | null;
  town: string | null;
  title: string;
  h1: string;
  description: string;
  words: number;
  images: number;
  faqs: number;
  modified: string;
  liveStatus: number;
  phase: 1 | 2 | 3 | null;
  status: "extracted" | "test-410" | "empty" | "redirect";
  redirectTo: string | null;
};
