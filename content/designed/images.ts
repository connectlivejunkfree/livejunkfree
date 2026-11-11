/**
 * Photos used across the site: real Live Junk Free job photos from
 * livejunkfree.ca, stored locally in /public/images/.
 * To change a photo, drop the new file in /public/images/ and update `src` (and `alt`).
 */

export const LOGO = {
  src: "/images/logo.webp",
  width: 350,
  height: 100,
  alt: "Live Junk Free",
} as const;

export const IMG = {
  crewStreet: "/images/crew-truck-street.webp", // two crew members in front of the LJF truck (home hero)
  crewHero: "/images/crew-hero.webp", // crew loading the LJF truck
  crewAbout: "/images/crew-about.webp", // crew member carrying boards to the truck
  crewTruck: "/images/crew-truck.webp", // two crew members at the truck
  couch: "/images/couch-removal.jpg", // living room, couch removal page
  estate: "/images/estate-cleanout.jpg", // estate cleanout page photo
  business: "/images/business-cleanout.jpg", // business cleanout in progress
  hoarding: "/images/hoarding-cleanout.jpg", // room before a hoarding cleanout
  deckAfter: "/images/deck-after.jpg", // yard after deck removal
  deckBefore: "/images/deck-before.jpg", // old deck before removal
  job1: "/images/job-1.webp",
  job2: "/images/job-2.webp",
  job3: "/images/job-3.webp",
} as const;

export type ImageKey = keyof typeof IMG;
