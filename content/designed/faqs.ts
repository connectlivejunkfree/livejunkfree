import { fact } from "@/lib/content/facts";
/**
 * FAQ lists, taken from the matching pages on livejunkfree.ca (checked 7 Nov 2026).
 * Answers support <Rich> markup (**bold**, [link](/path/)).
 * Each list also feeds FAQPage JSON-LD on its page.
 */

export type FaqItem = { q: string; a: string };
export type FaqList = { title?: string; intro?: string; items: FaqItem[] };

/** livejunkfree.ca/how-it-works/ */
const HOW = {
  items: {
    q: "What types of items do you remove?",
    a: "We remove a wide range of items, including furniture, appliances, electronics, mattresses, construction debris, yard waste, and more. If you're unsure if we can take a specific item, feel free to reach out to us.",
  },
  pricing: {
    q: "How does your pricing work?",
    // "or using our online booking system" left out: the new site has no booking engine.
    a: "Our pricing is based on the volume of items being removed, the type of items, and the difficulty of removal. Your quote explains the scope and any taxes or additional charges before work begins. You can also request a free estimate by contacting us.",
  },
  recycle: {
    q: "Do you recycle or donate items?",
    a: "Yes, we're committed to responsible disposal practices. Whenever possible, we recycle items or donate them to local charities. Our goal is to minimize waste and give back to the community whenever we can.",
  },
  areas: {
    q: "What areas do you serve?",
    a: "We proudly serve Greater Toronto Area. If you're unsure if we cover your area, please don't hesitate to contact us. We're always expanding our service areas to better serve our customers.",
  },
  advance: {
    q: "How far in advance do I need to schedule a pickup?",
    a: "We strive to accommodate our customers' schedules as much as possible. Same-day appointments may be available, subject to scheduling, but booking a day or two ahead gives you the most choice. If you're in a hurry, call us and we'll do our best.",
  },
} satisfies Record<string, FaqItem>;

/** livejunkfree.ca/locations/toronto/ */
const TO = {
  cost: {
    q: "How much does junk removal cost in Toronto, Ontario?",
    a: `Our Toronto junk removal pricing is volume-based: you pay based on how much space your items fill in our truck. ${fact("minimumPrice")}. Displayed load rates exclude applicable taxes. We provide a free onsite estimate, and your quote explains the scope and any taxes or additional charges before work begins.`,
  },
  sameDay: {
    q: "Do you offer same-day junk removal in Toronto?",
    a: `${fact("sameDay")} across Toronto, including downtown, North York, Scarborough, East York, Etobicoke and Midtown. Call ${fact("phone", "display")} to check today's availability.`,
  },
  condo: {
    q: "Do you do condo and high-rise junk removal in Toronto?",
    a: "Yes. Please arrange elevator or loading-dock approval with your building management, and we coordinate the pickup time with your booking. Tell us about the floor, elevator and any loading-dock rules when you enquire.", // QA 18 Nov B1-43: matches the visible guidance
  },
  restaurant: {
    q: "Do you remove restaurant equipment in Toronto?",
    a: "Yes — restaurant and food service equipment removal is a dedicated specialty of ours in Toronto. Kitchen equipment, fryers, ovens, bar setups, walk-in fridge removal, commercial furniture and full kitchen cleanouts — we handle it all quickly and professionally.",
  },
} satisfies Record<string, FaqItem>;

/** livejunkfree.ca estate cleanout page */
const ESTATE = {
  cost: {
    q: "How much does an estate cleanout cost?",
    a: `The price depends on the items, number of loads, access and work required. ${fact("quoteText")} Larger properties may take several loads. Applicable taxes and any job-specific charges are identified in the final quote.`,
  },
  early: {
    q: "Can I call before I know exactly what needs to go?",
    a: "Yes. Tell us roughly how many rooms are involved, what type of furniture or contents need removing and where the property is located. We can discuss what information is needed for a quote.",
  },
  whole: {
    q: "Can you clear a whole house?",
    a: "We handle larger cleanout enquiries, including projects involving several rooms or more than one truckload. We will review the contents, access and scheduling requirements before booking.",
  },
  there: {
    q: "Do I need to be at the property?",
    a: "Tell us who can provide access, approve the removal scope and identify which items should stay. We will confirm whether those arrangements work for the job.",
  },
  lift: {
    q: "Will your crew lift and carry furniture from inside?",
    a: "Our crew handles the agreed lifting and loading. Please tell us about stairs, elevators, heavy items or difficult access when requesting your quote.",
  },
  valuables: {
    q: "What should I do with valuables and family documents?",
    a: "Identify and set aside jewellery, cash, important records, family photographs, heirlooms and other belongings to keep before removal begins. Clearly mark items that must stay.",
  },
  buy: {
    q: "Do you buy furniture or estate contents?",
    a: "No. Live Junk Free provides a paid removal and cleanout service. We do not buy, appraise or sell estate contents.",
  },
  closing: {
    q: "Can you meet a closing date or urgent deadline?",
    a: "Tell us your desired date when you call. Availability depends on the job size, location and existing schedule.",
  },
  donate: {
    q: "What happens to furniture I would like donated?",
    a: "Tell us which items you hope to donate or recycle. We will confirm what handling options are available for those items.",
  },
} satisfies Record<string, FaqItem>;

export const FAQS = {
  home: { items: [HOW.items, HOW.pricing, HOW.advance, HOW.recycle, HOW.areas] },
  couch: {
    items: [
      { q: "Do you only remove pull-out couches?", a: "We take all furniture, sectionals, recliners, mattresses, and even whole room clearouts." },
      { q: "Can you remove them from the apartments?", a: "Yes. We work in high-rises, condos and walk-ups. Tell us the floor, elevator and access when you request a quote." },
      { q: "What if my couch won't fit through the door?", a: "We can take furniture apart when it won't fit through a doorway, and we take care moving items through your home." },
      { q: "Do you take other items too?", a: "Yes. Tell us everything that needs to go and we'll include it in one quote." },
      { q: "Are you insured?", a: "Absolutely. We're fully licensed and insured for your protection." },
    ],
  },
  estate: {
    title: "Questions families ask",
    intro: "Every situation is different. These are the questions we hear most.",
    items: [ESTATE.cost, ESTATE.early, ESTATE.whole, ESTATE.there, ESTATE.lift, ESTATE.valuables, ESTATE.buy, ESTATE.closing, ESTATE.donate],
  },
  commercial: {
    items: [
      { q: "What is a business cleanout?", a: "A business cleanout is a professional service that clears out unwanted items, furniture, and equipment from offices, warehouses, or retail spaces when relocating, renovating, or closing." },
      { q: "What services are included in a business cleanout?", a: `Typical work includes removing office furniture, equipment and unwanted stock. Cleaning isn't included unless it's agreed in your quote. ${fact("recycling")}.` },
      { q: "What does a cleanout business offer to clients?", a: "A cleanout business provides stress-free commercial space clearing with labour, hauling and disposal, with donation or recycling where practical." },
    ],
  },
  deck: {
    items: [
      { q: "Do you remove all types of decks, including wood and composite?", a: "We remove wood and composite decks. Tell us the size, materials and access, and we'll confirm the scope at the free onsite estimate." }, // QA 18 Nov B1-41
      { q: "How much does deck demolition cost?", a: `Deck demolition is quoted per project, based on size, materials and access. ${fact("quoteText")} ${fact("freeOnsiteEstimates", "long")}` },
      { q: "What areas do you serve for deck demolition?", a: "We serve Schomberg, Mississauga, Newmarket, Nobleton, Oshawa, Aurora, Bolton, East Gwillimbury, Toronto, and throughout the GTA." },
      { q: "Do I need a permit for deck removal?", a: fact("permits") },
      { q: "How long does deck demolition take?", a: "It depends on the deck's size, materials and access. We'll give you a time estimate when we see it at the free onsite estimate." },
    ],
  },
  toronto: { title: "Toronto questions", items: [TO.cost, TO.sameDay, TO.condo, TO.restaurant] },
  pricing: { title: "Pricing questions", items: [HOW.items, HOW.pricing, HOW.recycle, HOW.areas, HOW.advance] },
  lpEstate: { items: [ESTATE.there, ESTATE.closing, ESTATE.cost] },
} satisfies Record<string, FaqList>;

/** Generic FAQs for location template previews (the how-it-works answers). */
export const FAQ_LOCATION_GENERIC: FaqItem[] = [HOW.pricing, HOW.advance, HOW.areas];

export const FAQ_DEFAULT_TITLE = "Common questions";
