/**
 * Real Google reviews (all 5★), copied word for word from the Trustindex
 * widget on livejunkfree.ca's homepage. Don't edit the wording.
 */

export type Review = { name: string; text: string };

export const REVIEWS_HEADING = "What customers say";
export const REVIEW_SOURCE_LABEL = "Google review";
export const REVIEW_LINK_LABEL = "Read all reviews on Google";

export const REVIEWS = {
  suzette: {
    name: "Suzette Legault",
    text: "Nav and Ash got here before the designated time. That was great. They were extremely polite, and very efficient. A couch I had for 22 years was up and out the door in less than 10 min. I could not believe it! Nothing bumped or bumped off walls or anything. I'd recommend them to anyone. Experts for sure!",
  },
  ssh: {
    name: "SSH Canine Academy",
    text: "These guys were great. Not only did they come on time, they picked everything I sent them in the photos. There were a couple extra pieces of wood and they took them too at no extra charge. Polite, punctual, and kind. What more could you ask for? Will definitely call them again for junk removal",
  },
  madelyn: {
    name: "Madelyn Volpe",
    text: "We had a great experience with LiveJunkFree! They removed all the old appliances from my daughter’s condo, and the entire process was smooth and hassle-free. The team was professional, efficient, and handled everything with care. It was such a relief to have everything taken care of without any stress. We really appreciated their service and would happily recommend LiveJunkFree to anyone looking for reliable and professional appliance removal. Thank you for making the process so easy!",
  },
  cl: {
    name: "C L",
    text: "Nav and his partner came for a piano removal, they communicated well and were professional. Thanks for your help and coming back to put the door back, much appreciated! Would recommend to friends and family.",
  },
  raymond: {
    name: "Raymond Chan",
    text: "It was an excellent service! Very professional and gently handle to remove the large and heavy water tank… highly recommended!",
  },
  joan: {
    name: "Joan Savage",
    text: "The two men were excellent at removing our freezer from the basement... punctual and very efficient. Thank you very much.",
  },
  heather: {
    name: "Heather Gilroy",
    text: "Great service. Friendly, quick, polite and called when they were 30 minutes away to let me know their ETA.",
  },
  libbie: {
    name: "Libbie Lightstone",
    text: "They let me know when they were a half-hour away. They were very professional and lovely to work with.",
  },
  rifka: { name: "Rifka N", text: "Nice, professional team that was fast and efficient!" },
  cg: {
    name: "CG GG",
    text: "So friendly and amazing work they brought a huge bin into my unit and baggee garage rolled it out amazing service fast and efficient",
  },
} satisfies Record<string, Review>;

export type ReviewId = keyof typeof REVIEWS;

/** Which three reviews each page shows. Only the short reviews are used, so cards stay compact. */
export const REVIEW_SETS = {
  home: ["heather", "libbie", "raymond"],
  couch: ["rifka", "heather", "joan"],
  estate: ["libbie", "joan", "raymond"],
  office: ["rifka", "raymond", "heather"],
  toronto: ["heather", "libbie", "rifka"],
} satisfies Record<string, ReviewId[]>;
