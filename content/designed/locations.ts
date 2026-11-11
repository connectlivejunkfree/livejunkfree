/**
 * Service areas. 26 communities, slugs match livejunkfree.ca/locations/{slug}/.
 */

export type Area = { name: string; slug: string };

const kebab = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Exceptions to the kebab-case rule, kept to match the existing site. */
const SLUG_OVERRIDES: Record<string, string> = {
  Newmarket: "new-market",
};

export const areaSlug = (name: string) => SLUG_OVERRIDES[name] ?? kebab(name);

export const AREA_NAMES = [
  "Toronto", "Etobicoke", "Scarborough", "Mississauga", "Brampton", "Vaughan", "Woodbridge",
  "Richmond Hill", "Markham", "Aurora", "Newmarket", "East Gwillimbury", "King City", "Nobleton",
  "Schomberg", "Bolton", "Caledon", "Bradford", "Whitchurch-Stouffville", "Pickering", "Ajax",
  "Whitby", "Oshawa", "Uxbridge", "Port Perry", "Georgina",
] as const;

export const AREAS: Area[] = AREA_NAMES.map((name) => ({ name, slug: areaSlug(name) }));

/** Top 10 shown on the homepage, ordered by population. Reorder by LJF's actual job/search data. */
export const TOP_AREAS = [
  "Toronto", "Mississauga", "Brampton", "Vaughan", "Markham",
  "Richmond Hill", "Scarborough", "Etobicoke", "Oshawa", "Pickering",
];

export const REGIONS: Record<string, string[]> = {
  "City of Toronto": ["Toronto", "Etobicoke", "Scarborough"],
  "Peel Region": ["Mississauga", "Brampton", "Caledon", "Bolton"],
  "York Region": ["Vaughan", "Woodbridge", "Richmond Hill", "Markham", "Aurora", "Newmarket", "East Gwillimbury", "King City", "Nobleton", "Schomberg", "Whitchurch-Stouffville", "Georgina"],
  "Durham Region": ["Pickering", "Ajax", "Whitby", "Oshawa", "Uxbridge", "Port Perry"],
  "Simcoe County": ["Bradford"],
};

/** The one location page with full designed content. */
export const DESIGNED_CITY = "toronto";

export const findArea = (slug: string) => AREAS.find((a) => a.slug === slug);
