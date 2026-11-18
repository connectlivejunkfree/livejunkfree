/**
 * Site-wide content rules for the Batch 1 audit (docs/client/batch-1/).
 *
 * The ~780 pages are individual content files (content/pages/**, content/blog/**),
 * not one shared template, so "fix it at the template" means: apply the same rule
 * to every file. This script is that rule set. It is idempotent: run it again after
 * new content is added and it only touches what still breaks a rule.
 *
 *   node scripts/content-rules.mjs            apply + write the report
 *   node scripts/content-rules.mjs --dry      report only
 *
 * Claims that wait on Nav become {{fact:…}} / {{min_price}} tokens, resolved from
 * content/business-facts.json at build time (src/lib/content/facts.ts). The report
 * (docs/client/batch-1/content-rules-report.json) records before/after counts per rule.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DRY = process.argv.includes("--dry");
// LJF_RULES_LOG=<file>: write every sentence a rule replaced or dropped (rule, field, replacement, original) as TSV.
const REPLACE_LOG = process.env.LJF_RULES_LOG ? [] : null;
const ROOT = process.cwd();

// ---------------------------------------------------------------- helpers
const SENT = /(?<=[.!?])\s+(?=[A-Z0-9"“‘(★])/;
const isShort = (s) => s.length <= 110 && !/[.!?]\s+\S/.test(s.trim().replace(/[.!?]$/, ""));
const tidy = (s) =>
  s
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,;:])\s*([.!?])/g, "$2")
    .replace(/\(\s*\)/g, "")
    .replace(/\s+—\s*$/, "")
    .trim();

/** Keep the leading/trailing whitespace of an inline fragment (inline text is split across nodes). */
function keepEdges(orig, next) {
  const lead = orig.match(/^\s*/)[0], trail = orig.match(/\s*$/)[0];
  return next ? lead + next.trim() + trail : "";
}

// ---------------------------------------------------------------- rules
// Each rule: id, ref (audit rows), find (counting regex), and one or more transforms.
//   clause: [regex, replacement][] applied to every string (precise phrase surgery)
//   short:  replacement for a short label/title that still matches after clauses
//   drop:   remove sentences of long text that still match (true) — a lone sentence gets `short` instead
//   skip:   field kinds the rule never touches (e.g. FAQ questions)
const RULES = [
  {
    id: "demo-slots", ref: "R7, OBS-02, OBS-149, OBS-153",
    find: /demo slots?/i,
    clause: [[/Ask About This Week['’]s Demo Slots/gi, "Book a Free Onsite Estimate"]],
    short: "Book a Free Onsite Estimate",
  },
  {
    id: "competitor-30-50", ref: "R1, G01, OBS-01, OBS-134, OBS-138, OBS-141",
    find: /30\s*[–-]\s*(50|\{\{percent_50\}\})\s*%?/,
    clause: [
      [/^Commercial(?=30)/, ""],
      [/,?\s*(and\s+)?(typically\s+|usually\s+|often\s+)?\(?\s*30\s*[–-]\s*(50|\{\{percent_50\}\})\s*%?\s*(less|lower|cheaper|under|below|lighter|off)?[^.,;)—]*\)?/gi, ""],
    ],
    short: "{{fact:competitorComparison}}",
    clauseShortOnly: true,
    drop: true,
    faqQ: "How does Live Junk Free keep its pricing fair?",
  },
  {
    id: "response-time", ref: "OBS-28, OBS-32, OBS-37, OBS-57, OBS-87, OBS-110, OBS-131",
    find: /\b(one|1)[- ]minute|\b60[- ]second|\b(takes|in) (just )?under (2|two) minutes|\bin (just |under )?(60 seconds|2 minutes|two minutes)\b|answered in \d+ minute/i,
    clause: [
      [/,?\s*(we\s+)?(calls?\s+)?(are\s+)?answered in (1|one) minute( or less)?\.?/gi, ""],
      [/\b(book|booking|scheduled|secure your spot)( online)?( in| within)( just| under)? (60 seconds|2 minutes|two minutes|a minute)/gi, (m, a) => (a.toLowerCase().startsWith("book") ? a : a.toLowerCase().startsWith("secure") ? a : "booked")],
      [/\s*[—–-]?\s*it takes (just )?under (2|two) minutes/gi, ""],
      [/\bin (just |under )?(60 seconds|2 minutes|two minutes)\b/gi, ""],
      [/60-Second Booking Process/gi, "Easy Booking by Phone or Online"],
    ],
    short: "Easy Booking by Phone or Online",
    drop: true,
  },
  {
    id: "fixed-duration", ref: "G02, OBS-22, OBS-25, OBS-35, OBS-37, OBS-53, OBS-57, OBS-79, OBS-87, OBS-91, OBS-101, OBS-105, OBS-109, OBS-115, OBS-119, OBS-124, OBS-128",
    find: /\b\d+\s*[–-]\s*\d+\s*hours?\b|\bunder (an|one) hour\b|\bwithin (an|one) hour\b|\bin under \d+ minutes\b|\b\d+[- ]minute (job|pickup|removal|visit)\b|\bwithin a few hours\b|\bgone before dinner\b|\b(within|in) a couple of hours\b|\bsame afternoon\b|\bunder (two|2|three|3|four|4) hours?\b|\bin under 2$/i,
    clause: [
      [/,\s*(and\s+)?(it['’]s\s+)?(typically|usually|often|most jobs are|most are|generally)?\s*(done|finished|completed|wrapped up|cleared|over)?\s*(in|within) (just |under |about |roughly )?(\d+\s*[–-]\s*\d+|an?|one|\d+) (hours?|minutes?)\b(\s+or less)?/gi, ""],
      [/,?\s*(most\s+\w+\s+)?(take|takes|run|runs|last|lasts)\s+(just |about |only )?\d+\s*[–-]\s*\d+\s*hours?/gi, ""],
      [/Gone Before Dinner/gi, "Scheduled Around Your Day"],
    ],
    short: "Timing confirmed at your estimate",
    drop: true,
  },
  {
    id: "damage-guarantee", ref: "G02, OBS-27, OBS-46, OBS-70, OBS-87, OBS-119",
    find: /zero[- ]damage|\bno[- ]damage\b|damage[- ]free|without (a|any|leaving a) (scratch|scuff|mark)|without a mark left behind/i,
    clause: [
      [/,?\s*(and\s+)?(no mess,\s*)?no damage\b/gi, ""],
      [/\s*[,—–-]+\s*Zero Damage\b/gi, ""],
      [/,?\s*without (a|any|leaving a) (scratch|scuff|mark)( left behind)?/gi, ""],
      [/Damage-Free Guarantee/gi, "Careful Removal"],
    ],
    short: "Careful Removal",
    drop: true,
  },
  {
    id: "satisfaction-guarantee", ref: "G02, OBS-22, OBS-25, OBS-35, OBS-101, OBS-105",
    find: /100\s*%\s*(satisf|locked|guarantee)|satisfaction (guarantee|promise)|best (price|service) guaranteed|satisfaction guaranteed/i,
    clause: [
      [/\s*[—–-]\s*Best (Service|Price) Guaranteed/gi, ""],
      [/\s*(&|and)\s*Best Price Guaranteed/gi, ""],
      [/,?\s*(with\s+)?(a\s+)?100\s*%\s*satisfaction (guarantee|promise)( and)?/gi, (m) => (/ and$/.test(m) ? " with" : "")],
      [/\b(our quotes are )?100\s*%\s*locked in/gi, "$1confirmed before work starts"],
    ],
    short: "{{fact:licensedInsured}}",
    drop: true,
  },
  {
    id: "lease-ready", ref: "G02, OBS-05, OBS-28, OBS-148, OBS-150, OBS-155",
    find: /lease[- ]ready|inspection[- ]ready|move[- ]in[- ]ready|spotless|never slips a lease date|lands on the possession date|ready for new occupants/i,
    clause: [
      [/,?\s*(and|&)\s*(move[- ]in|lease|inspection)[- ]ready\b/gi, ""],
      [/\s+(and\s+)?(left\s+)?(lease|move[- ]in|inspection)[- ]ready\b/gi, ""],
      [/\bspotless\b/gi, "tidy"],
      [/,?\s*(and\s+)?(leaves it\s+)?completely ready for new occupants( or renovations)?/gi, ""],
    ],
    short: "Scheduled around your move dates",
    drop: true,
  },
  {
    id: "certified-recycling", ref: "A2, G09, OBS-36, OBS-49, OBS-62, OBS-71, OBS-78, OBS-108, OBS-116, OBS-120, OBS-148",
    find: /\bcertified\b|zero[- ]landfill|\b(75|80|85|90|95|98)\s*%\+?\s*(of\s+)?(\w+\s+){0,4}(recycl|divert|donat|kept out|landfill)|R2[- ]certified/i,
    clause: [
      [/\bR2[- ]certified\s+/gi, ""],
      [/\b(through|at|via|to)\s+certified\s+(facilities|sites|centres|centers)\b/gi, "$1 recycling $2"],
      [/\bcertified\s+(recycl\w*|e-waste recycl\w*|facilit\w*|program\w*|partners?|processors?|disposal|sites?|centres?|centers?|channels?|outlets?|scrap|metal)/gi, "$1"],
      [/\bcertified\s+(team|technicians?|crews?|professionals?|staff|experts?|movers?)/gi, "insured $1"],
      [/,?\s*(with\s+)?(a\s+)?zero[- ]landfill (policy|goal|approach|promise)/gi, ""],
    ],
    short: "{{fact:recycling}}",
    drop: true,
    dropIf: /\b(75|80|85|90|95|98)\s*%\+?|zero[- ]landfill|\bcertified\b/i,
  },
  {
    id: "specialist-claims", ref: "G09, OBS-61, OBS-73, OBS-86, OBS-96, OBS-108, OBS-117, OBS-118, OBS-122, OBS-125, OBS-126, OBS-128",
    find: /data (wiping|destruction|sanitiz|sanitis)|wipe[sd]? (the )?(hard )?drives?|hard[- ]drive (destruction|shredding)|secure (document )?(destruction|shredding)|document shredding|medical (waste|office)|refrigerant|freon|disconnect(s|ed|ing)? (the )?(gas|electric|plumbing|water|power|hot tub|appliance)|handle (all |the |any )?(municipal )?permits|permits? (handled|for you)|24\/7 emergency|emergency (service|demolition|removal)|structural demolition|foundation (removal|demolition|extraction)|chemical demolition|excavator/i,
    drop: true,
    short: "",
  },
  {
    id: "no-hidden-fees", ref: "Answers B1.4",
    find: /no hidden (fees|charges|costs)|all[- ]inclusive|tax(es)? included|no extra (fees|charges)|no surprise (fees|charges|costs)|zero hidden|all-in (price|pricing|quote|rate|cost)s?|price you approve is the price you pay|nothing added at the door|no add-ons/i,
    clause: [
      [/\s*[,—–-]\s*(and\s+)?(absolutely\s+)?no hidden (fees|charges|costs)\b/gi, ""],
      [/\s*\(\s*no hidden (fees|charges|costs)\s*\)/gi, ""],
      [/\bNo hidden (fees|charges|costs)[.!]?\s*/g, ""],
      [/\ball[- ]inclusive\s+/gi, ""],
      [/\ball-in (price|pricing|quote|rate|cost)/gi, "upfront $1"],
      [/\s*[—–-]?\s*the price you approve is the price you pay\.?/gi, "."],
      [/,?\s*(with\s+)?no surprise (fees|charges|costs)/gi, ""],
    ],
    short: "{{fact:competitorComparison}}",
    drop: true,
  },
  {
    // The same all-in promise in other words: "what we quote is exactly what you pay", "one price covers
    // everything", "price locked in", "no fuel / stair / disconnection surcharges", "no added fees". The card
    // doesn't guarantee these: stairs, disassembly, heavy items, extra labour and taxes are confirmed in the
    // final quote (A1.4, A1.7), so the promise is removed, not reworded into a new guarantee.
    id: "all-in-equivalents", ref: "Answers A1.4, A1.7, B1.4",
    clause: [
      // "…confirmed free at the walkthrough, and it's the number on the invoice, with nothing added afterward." → keep the free estimate
      [/,?\s*and (it[’']s|that figure is|that's) (the number|the figure|what)( that)? (appears )?on the invoice(,\s*with nothing added( once the crew starts hauling| afterward| afterwards)?)?/gi, ""],
      [/,?\s*and (that figure is )?what appears on the invoice/gi, ""],
      [/,?\s*and once locked in,? it holds/gi, ""],
      [/,?\s*(and|—|–)\s*(it )?holds to the invoice/gi, ""],
      [/,?\s*(and|with) nothing added (once the crew starts hauling|afterward|afterwards)/gi, ""],
      // headings: "Farm and Marsh-edge removal, priced the same as town" → "Farm and Marsh-edge removal"
      [/,\s*(priced the same as|same flat rates?)\b[^.!?]*$/i, ""],
    ],
    find: /covers everything(?! from)|number is the bill|sits inside one (written )?price|priced the same as|same flat rates?( as)?\b|identical pricing|no surprise (fee|charge|cost|line item)s?|(number|figure)( that)? (appears )?on the invoice|appears on the invoice|holds to the invoice|locked in,? it holds|locked once|nothing added (once|afterward|after)|every disposal fee inside|no minimum charge|cost to absorb|line on your invoice|\b(one (price|number|figure|quote)|quote|price) covers (everything|it all)|(it['’]s|it is|price is) locked|nothing changes between|(final )?(bill|invoice) (matches|will match|is the same as)|same (price|number|figure) on (the|your) (invoice|bill)|covers the whole operation|every cost is inside|(it's|it is) all in (your|the|one) quote|all included in (your|the|one) (upfront )?(quote|price)|everything included, locked|(is|that's|that is) (exactly |precisely )?what you(['’]ll)? pay|is (exactly )?the price you pay|(approved|quoted) figure is the invoiced figure|holds through to the invoice|price (is|stays) locked|locked in before|locked[- ]in (price|quote|rate)|locked before we|locked the moment|fuel surcharges?|no (stair|staircase|stairs|heavy[- ]item|weight|disconnection|area|gta|rural|travel|mileage|distance) (surcharges?|fees?|premiums?|charges?)|no extra charge for|without (any )?(extra|hidden|surprise|added|additional) (fees|charges|costs)|no (added|additional) (fees|charges|costs)|surprise (disposal )?(charges|fees|costs|add-ons|bills?)|last-minute (add-ons|charges|surcharges|fees)|not yours to pay for|costs nothing extra|guaranteed,? (upfront |flat )?price/i,
    short: "{{fact:competitorComparison}}",
    drop: true,
  },
  {
    // "Sofas … dismantled at no extra charge", "disconnect your freezer at no extra charge": stairs, disassembly,
    // heavy items and extra labour can affect the final quote (A1.7). Free estimates / free quotes stay.
    id: "no-extra-charge", ref: "Answers A1.4, A1.7",
    find: /\b(at |for |with )?no (extra|additional|added) (charge|cost|fee)s?\b|free of (extra |additional )?charge|included at no (extra |additional )?cost|at no cost to you/i,
    unless: /estimat|quot(e|ed|ing)\b|walkthrough|walk-through|assessment|consultation|\b(call|phone|ask)\b[^.]{0,30}(free|no (extra|additional) charge)/i,
    replaceWith: "{{fact:pricingIntro.extra}}",
    short: "{{fact:competitorComparison}}",
    drop: true,
  },
  {
    // Certificates of insurance / COIs / WSIB / insurance dollar values (B3.1).
    id: "insurance-docs", ref: "Answers B3.1",
    find: /\bCOIs?\b|certificates? of insurance|insurance (certificates?|documentation|paperwork)|\bWSIB\b|\$\s?\d+(\.\d+)?\s?(million|M)\b[^.]{0,30}(liability|insurance|coverage|insured)|(liability|insurance|coverage) (of|up to) \$\s?\d/i,
    replaceWith: "{{fact:insuranceDocs}}.",
    faqQ: "Is Live Junk Free insured?",
    faqA: "{{fact:insuranceDocs}}.",
    short: "{{fact:licensedInsured}}",
    drop: true,
  },
  {
    // Floor runners, padded doorways/elevators, corner guards, wall protection (B3.3).
    id: "protection-procedure", ref: "Answers B3.3",
    find: /floor runners?|\bprotective pads?\b|\b(look|looks|stay|stays) (exactly )?(as|like) (they|it) (did|was|were) before\b|\bstays? intact\b|\b(specialized |special |protective )?padding\b|\bfloor (coverings?|protection)\b|protective (blankets|padding|coverings?)|pad(ded|s|ding)? (the |every |all )?(doorways?|door frames?|frames?|elevators?( cabs?)?|corners?|walls?|banisters?|railings?)|corner guards?|(floor|wall|corridor)( and (floor|wall|corridor))? protection|protect(s|ing)? (the )?(corridor |hallway |common[- ]area )?walls|drop cloths/i,
    replaceWith: "{{fact:propertyProtection}}.",
    short: "{{fact:propertyProtection}}",
    drop: true,
  },
  {
    // Photo / damage documentation for landlords, LTB claims, lease-compliance evidence, written inventories (B5.18),
    // and "ready for the landlord's inspection" (B6.2).
    id: "records-reports", ref: "Answers B5.18, B6.2",
    find: /(photo|damage|condition|photographic) documentation|photographed (on arrival|ahead of|before (the|handover|hand-off)|for (the|your) (landlord|records))|photo(s|graphs)? (of the (unit|property)['’]?s? condition|before anything is (moved|removed))|written (record|account|inventory) of (everything|what was|all items)|evidence (of )?lease compliance|LTB (damage )?claims|Landlord and Tenant Board|deposit disputes|ready for (the )?(landlord['’]s|landlord|final|move-out|building['’]?s?) inspection|for the landlord['’]s inspection/i,
    clause: [
      [/,?\s*(and )?(ready|returned broom-swept|left [\w -]{0,20}) for the landlord['’]s inspection/gi, ""],
      [/,?\s*ready for (the )?(landlord['’]s|landlord|final|move-out) inspection/gi, ""],
      [/,?\s*(swept )?and photographed ahead of the landlord['’]s inspection/gi, " and swept"],
    ],
    short: "",
    drop: true,
  },
  {
    // Donation receipts (B4.4).
    id: "donation-receipts", ref: "Answers B4.4",
    find: /(donation|tax|charitable) receipts?|receipts? for (gifted|donated) (items|furniture|goods)/i,
    replaceWith: "{{fact:recycling}}.",
    faqQ: "Can my items be donated?",
    faqA: "{{fact:recycling}}.",
    short: "",
    drop: true,
  },
  {
    // Cleaning, disinfection, biohazard work as an LJF service (B6.2, B6.7).
    id: "cleaning-claims", ref: "Answers B6.2, B6.7",
    find: /\b(we|our (team|crew)s?|live junk free)( also| will)? (handle|provide|offer|do|perform|include|complete)s?\b[^.]{0,30}(deep[- ]clean|cleaning|disinfect|sanitiz|sanitis)|deep clean with|cleaning\/disinfection|house cleaning for hoarders|biohazard (protocols?|remediation|clean-?up|cleaning|removal|handling)|(mitigate|handle|remove|clean up) (any )?biohazards|trained to (identify|handle|manage)[^.]{0,20}biohazard|(sanitizing|disinfecting) tools|biohazard (management|containment|certification)|deep cleaning and sanitization|(professional-grade|commercial) sanitization|addressing any biohazard|cleanout includes deep cleaning|handle[^.]{0,40}biohazards/i,
    replaceWith: "{{fact:cleanupScope}}.",
    short: "",
    drop: true,
  },
  {
    // "We guarantee same-day service", "guaranteed timeline", "Can it really be guaranteed before a lease
    // deadline? Yes" (B2.1 availability-dependent scheduling; B3.2 no unconditional promises; OBS-05).
    id: "timeline-guarantee", ref: "Answers B2.1, B3.2, OBS-05",
    find: /\bguarantee[ds]?\b[^.?]{0,60}\b(same[- ]day|timeline|completion|deadline|on[- ]time|arrival|turnaround|finish|done|cleared|before (the|a|your|our))|\bguaranteed,? (timeline|completion|resolution|turnaround|deadline|arrival|same[- ]day)|be guaranteed (before|by|for)|\b\d+[- ]hour (rapid|cleanout|turnaround|guarantee|system)/i,
    unless: /\b(can['’]?t|cannot|not|no|never|don['’]t|doesn['’]t|won['’]t)\b[^.]{0,20}guarantee/i,
    faqQ: "Can you work around a move-out, closing or lease deadline?",
    faqA: "{{fact:scheduling}} {{fact:sameDay}}.",
    replaceWith: "{{fact:scheduling}}",
    short: "{{fact:sameDay.short}}",
    drop: true,
  },
  {
    // Excavation, site grading, backfilling, post-hole filling as part of the job (B5.10, B5.11).
    id: "site-work", ref: "Answers B5.10, B5.11",
    find: /\b(we['’]ll|we will|we|our (experienced )?(team|crew))( carefully)? excavat|expert excavation|complete excavation|(proper )?site grading|(includes|including)[^.]{0,40}\b(grading|backfill)|post hole filling|excavating and hauling|carefully excavat|improper excavation/i,
    replaceWith: "{{fact:siteWorkScope}}.",
    short: "",
    drop: true,
  },
  {
    // "Your quote covers labour, truck, fuel and disposal in one number", "every disposal fee included",
    // "freezes on approval": displayed rates exclude taxes and no charge is promised as included
    // (Manisha follow-up 18 Nov 2026; A1.4, A1.7).
    id: "inclusions", ref: "Manisha 18 Nov follow-up; A1.4, A1.7",
    find: /\b(figure|number|quote|rate|price|cost|pricing)s?\b[^.?]{0,50}\b(covers?|covering|includ\w*|inside|all in)\b[^.?]{0,70}\b(disposal|dump|tipping|landfill|fuel|tax(es)?|HST)\b|\b(disposal|dump|tipping|landfill) (fees?|costs?|charges?)\b[^.?]{0,40}\b(included|inside|locked|covered|built in)|\b(labou?r|crew|hauling|loading)\b[^.?]{0,60}\bdisposal\b[^.?]{0,40}\b(included|all in|inside|in one (number|figure|price)|one number|one figure)|freezes on approval|covers? the whole operation|every cost involved/i,
    replaceWith: "{{fact:taxNote}}. {{fact:pricingIntro.extra}}",
    faqQ: "Are disposal fees and taxes included?",
    faqA: "{{fact:taxNote}}. {{fact:pricingIntro.extra}}",
    short: "{{fact:competitorComparison}}",
    drop: true,
  },
  {
    // Structural / attached demolition: subject to assessment, never universal (Manisha follow-up 18 Nov; B5.10).
    id: "structural-assessment", ref: "Manisha 18 Nov follow-up; B5.10",
    find: /(?<!non-)load-bearing|(?<!non-)structural (removal|walls?|assessments?|recycling|safety)|temporary (support|beam)s?|beam (installation|solution)s?|engineering (assessments?|support)|code-compliant|for any structure|\b(any|every|all) (types? of )?(attached|structural) (demolition|structures?|garages?|work|walls?)\b|\battached (garages?|structures?|decks?|sheds?|additions?)\b[^.?]{0,40}\b(no problem|always|guarantee|any size|whatever)|\bwe (can )?(demolish|take down|remove) (any|every|all) (structures?|buildings?)/i,
    replaceWith: "{{fact:structuralDemolition}}.",
    short: "",
    drop: true,
  },
  {
    // Evening / after-hours / overnight presented as standard or included. Weekends are approved "subject to
    // scheduling"; evenings aren't (B2.2; Manisha follow-up 18 Nov). "May be available" wording stays.
    id: "evening-standard", ref: "Answers B2.2; Manisha 18 Nov follow-up",
    find: /\b(evenings?|after[- ]hours|overnight|late[- ]night)\b[^.?]{0,60}\b(standard|offered|included|is available|are available|available|as standard|execution|attendance|appointments?|scheduling|slots?|walkthroughs?|work|removal|cleanouts?|demolition|crews?)\b|^(Evening|After-hours|Overnight)\b[^.?]{0,50}$/i,
    unless: /\b(may|might|when available|where available|depending|subject to|ask (our|about)|confirm|can be discussed|if needed)\b|\bonly be home\b|become difficult|\?\s*$/i,
    replaceWith: "{{fact:scheduling}}",
    short: "{{fact:weekendPickup}}",
    drop: true,
  },
  // ------------------------------------------------------------ QA 18 Nov (prompt v3): patterns, not phrases
  {
    // Guarantees and absolutes. Title adjectives are cut ("Fair Pricing Guaranteed" → "Fair Pricing"); any
    // other sentence carrying one is removed.
    id: "qa-guarantees", ref: "QA 18 Nov §2A guarantees; Answers B3.2",
    find: /\bguarantee(d|s|ing)?\b|\bwe['’]ll make it right\b|\b100\s?%|\bzero[- ](damage|downtime|risk|stress|hassle)\b|\bno damage\b|\bdamage[- ]free\b|\bwithout (causing |any )*(damage|harm|a scratch)\b|\bno job (is )?too (big|small|tricky|large|hard)\b|\beliminat(e|es|ing) the risk\b|\bprevent(s|ing)? (any|the) spread\b|\bcompletely (clean|protected|safe|empty)\b|\bspotless\b|\blivable\b|\bready for (occupants|an installer|the next tenant|new tenants|the next owner)\b|\bleft ready\b|\bworry[- ]free\b|\brisk[- ]free\b|\bnever (damage|scratch)\b/i,
    unless: /\b(no|can['’]t|cannot|don['’]t|doesn['’]t|never|isn['’]t|not|aren['’]t)\b[^.]{0,30}\bguarantee|\bsubject to assessment\b/i,
    clause: [
      [/\bProperty Protection Guarantee\b/g, "Careful Removal"],
      [/\b(Total Cleanup|Satisfaction|Quality|Price|Pricing|Service) Guarantee\b/g, "Clear Quotes"],
      [/^(\W*)Guaranteed\s+(?=[A-Z])/, "$1"],
      [/\s+Guaranteed(?=[.!]?$)/, ""],
      [/\s*[—–-]\s*guaranteed(?=[.!]?$)/i, ""],
      [/,?\s*(and )?(without (causing |any )*(damage|harm|a scratch))(?=[.,!]|$)/gi, ""],
      [/\s*[—–-]?\s*no job (is )?too (big|small|tricky|large|hard)( (or|and) (too )?(big|small|large|tricky|hard))?( for us)?[.!]?/gi, ""],
    ],
    short: "Careful Removal",
    drop: true,
  },
  {
    // Price promises, comparisons and promotions.
    id: "qa-price", ref: "QA 18 Nov §2A price; Answers A1.4, A1.7, B1.2, B1.4",
    find: /\bprice is final\b|\b(bill|invoice|price|quote|number|figure)s? (does not|doesn['’]t|won['’]t|will not|never) (change|move|go up|increase)\b|\bno hidden (fees|labou?r|charges|costs|surprises)\b|\bno (disposal |fuel |stair |hourly )?surcharges?\b|\bno last[- ]minute\b|\bno (premium|extra|emergency|weekend|after[- ]hours|hourly|travel|area) (fees?|charges?|rates?|premiums?)\b|\brather than a premium\b|\bflat[- ]pric(e|ed|ing)\b|\bregardless of (the )?(season|time of year|weather)\b|\bbest pric(e|es|ing)\b|\bcheapest\b|\bsignificantly cheaper\b|\b\d+\s?[–-]\s?\d+\s?% (less|cheaper|lower|under|below|savings?)\b|\bspecial (project )?(rates?|savings|pricing|discounts?)\b|\bbulk\b|\bvolume discounts?\b|\bmulti-?(item|unit|device|location|shed|garage|piano)s?\b|\bbundl(e|es|ed|ing)\b|\bpair[- ]and[- ]save\b|\bprice[- ]match|\bpreferred rates?\b|\b(price|quote|rate) (is |stays )?locked\b|\bdiscount(s|ed)?\b|\bmulti-?(site|suite|bed|floor|property|properties|room|truck|load)s?\b|\b(volume|portfolio|landlord|contractor|recurring|program|programme)s?( &| and)?[\w ]{0,20}\b(rates|pricing|programs?|programmes?)\b|\bbetter pricing\b|\bflat\b[^.]{0,20}\b(price|pricing|rate|fee|figure|number|quote)\b|\b(price|pricing|rate|fee)s? (is|are) flat\b|\b(quote|quoted|price|priced)[^.]{0,40}\bfrom (a single |one |your )?(photo|picture)s?\b|\bset rates\b/i,
    unless: /\bbulky\b|\bbulk (item|waste|garbage|trash) (pickup|collection|day)\b|\bmulti-?unit (building|residential|propert|complex|dwelling)|\b(curb|curbside|driveway)\b/i,
    clause: [
      [/^Fast Booking & Best Price$/, "Fast Booking & Clear Quotes"],
      [/\bBest Price\b/g, "Clear Quotes"],
    ],
    replaceWith: "{{fact:changedScope}}.",
    short: "{{fact:competitorComparison}}",
    drop: true,
  },
  {
    // Unconditional timing, response and coverage promises.
    id: "qa-timing", ref: "QA 18 Nov §2A timing; Answers B2.1–B2.3",
    skip: ["faq.q"], // a customer question is fine as asked; its answer is what gets checked
    find: /\bmost (days|of the time)\b|\bin most (GTA )?areas\b|\bacross all\b|\bbooked in minutes\b|\bgone in one visit\b|\bone visit\b|\bin one trip\b|\bimmediate(ly)? confirm|\binstant(ly)?\b|\bwithin (a few|\d+|one|two|an?) (minutes?|hours?)\b|\bunder (an|one|\d+) hours?\b|\b\d+\s?[–-]\s?\d+[- ]?(hours?|hrs?|minutes?)\b|\b\d+-minute\b|\bone minute\b|\b60[- ]second|24\/7|\bemergenc(y|ies)\b|\ball[- ]weather\b|\bovernight\b|\bafter[- ]hours\b|\bgone (today|before dinner|the same)\b|\bon the spot\b|\bimmediate (service|response|pickup|removal|help|attention)\b|\b(review|reply|respond|get back|quote)\w*\b[^.]{0,40}\bimmediately\b/i,
    unless: /\b(we|live junk free) (don['’]t|do not|can['’]t|cannot|won['’]t|never) (offer|provide|promise)|\bnot guaranteed\b|\bask (our team|us) about\b|\?\s*$/i,
    clause: [
      [/^Booked in minutes\. Gone in one visit\.$/, "Quick quotes. Removal scheduled around you."],
      [/\s+(in|on|with) (just |a single |only )?one visit\b/gi, ""],
      [/,?\s*(often |usually |typically |most jobs are |most are )?(done |finished |completed |cleared )?(with)?in (just |under |about )?(a few|\d+) (minutes|hours)\b/gi, ""],
      [/\bon the spot\b/gi, "at the onsite estimate"],
      [/\b(and )?(instant|instantly) /gi, ""],
    ],
    replaceWith: "{{fact:scheduling}}",
    short: "{{fact:pickupTimes}}",
    drop: true,
  },
  {
    // Weekend / holiday / evening service offers: weekends are approved "subject to scheduling" (Manisha 18 Nov);
    // anything else gets the qualifier. DIY / advice text ("a simple weekend plan") is left alone.
    id: "qa-weekend", ref: "QA 18 Nov §2A timing; Manisha follow-up 18 Nov",
    skip: ["faq.q"], // a customer question is fine as asked; its answer is what gets checked
    find: /\b(weekends?|holidays?|evenings?)\b[^.]{0,50}\b(appointments?|slots?|pickups?|service|availability|available|scheduling|work|removals?|cleanouts?|clearances?|options|crews?|bookings?)\b|\b(appointments?|slots?|pickups?|services?|scheduling|available|clearances?|bookings?)\b[^.]{0,40}\b(weekends?|holidays?)\b/i,
    unless: /\b(subject to (availability|scheduling)|may be available|depending on|when available|where available|if available|ask (our team|us) about)\b|\b(DIY|yourself|your own|plan is|wreck|weekend of|entire weekend)\b|\?\s*$/i,
    transform: (t) => t.split(SENT).map((sent) => {
      if (!/\b(weekends?|holidays?|evenings?)\b/i.test(sent) || /\b(subject to (availability|scheduling)|may be available|depending on|when available|where available|if available|ask (our team|us) about)\b/i.test(sent) || /\b(DIY|yourself|your own|plan is|wreck|weekend of|entire weekend)\b|\?\s*$/i.test(sent)) return sent;
      return /[.!]$/.test(sent) ? sent.replace(/[.!]$/, ", subject to scheduling.") : `${sent} (subject to scheduling)`;
    }).join(" "),
  },
  {
    // Sorting and sweeping as part of the job (B6.1 sorting decisions are the customer's; B6.2 light sweeping only if agreed).
    id: "qa-sort-sweep", ref: "QA 18 Nov §2A handling; Answers B6.1, B6.2",
    skip: ["faq.q"], // a customer question is fine as asked; its answer is what gets checked
    find: /\b(sorting|sweep(s|ing)?|sweep-up|swept)\b/i,
    unless: /\b(you|your family|the family|the owner|the executor|customers?)\b[^.]{0,40}\bsort|\b(only if|unless)\b[^.]{0,40}\b(agreed|arranged|quote)/i,
    clause: [
      [/\b(careful |responsible )?sorting(,| and)\s+/gi, ""],
      [/,?\s*(and )?(final )?sweep[- ]up\b/gi, ""],
      [/,?\s*(and )?(broom[- ])?swept( clean)?\b/gi, ""],
      [/,?\s*(and )?(we )?sweep (the |your )?(floors?|space|area|it|unit)( up| clean)?\b/gi, ""],
      [/,\s*(?=[.!]|$)/g, ""],
    ],
    replaceWith: "{{fact:cleanupScope}}.",
    short: "",
    drop: true,
  },
  {
    // "Recycled" / donation claims without a qualifier (B4.1, B4.3, B4.4).
    id: "qa-recycled", ref: "QA 18 Nov §2A recycling; Answers B4.1–B4.4",
    skip: ["faq.q"], // a customer question is fine as asked; its answer is what gets checked
    find: /\brecycled\b|\bdonat(e|ed|es|ion|ions|ing)\b[^.]{0,80}\b(schools?|community cent(re|er)s?|charit(y|ies)|shelters?|churches|habitat)\b|\b(schools?|community cent(re|er)s?|charit(y|ies)|shelters?)\b[^.]{0,60}\bdonat|\bcharity before landfill\b|\b(always|every (item|job|load|appliance|mattress|piano)|all items?)\b[^.]{0,30}\b(recycl|donat)|\b(recycl|donat)\w*\b[^.]{0,60}\bevery (single )?(job|load|pickup)\b/i,
    unless: /\b(where|when|whenever|if|wherever) (possible|practical|feasible|suitable)\b|\bsuitable items\b/i,
    clause: [[/\bCharity Before Landfill\b/gi, "Donate or Recycle Where Possible"]],
    transform: (t) => t.split(SENT).map((sent) => {
      if (/\b(where|when|whenever|if|wherever) (possible|practical|feasible|suitable)\b|\bsuitable items\b/i.test(sent)) return sent;
      return sent
        .replace(/\b(donated|given|passed on) to (local |area )?(charities|charity|schools|community cent(re|er)s|shelters|churches|community organi[sz]ations)((,|\s+and|\s+or)\s+[^.;]*)?/i, "donated where possible")
        .replace(/\b(donate|give) (usable |unwanted |gently used )?(items|furniture|goods|pianos?) to (local )?(charities|schools|community cent(re|er)s|shelters)\b/i, "donate suitable $3 where possible")
        .replace(/\b(always|every item is|all items are) (recycled|donated)\b/i, "$2 where possible")
        .replace(/\brecycled( properly| responsibly| correctly| right)?\b(?![^.]{0,40}\b(where|when) possible)/i, (m) => (m[0] === "R" ? "Recycled Where Possible" : "recycled where possible"));
    }).join(" "),
    short: "{{fact:recycling}}",
    drop: true,
  },
  {
    // Superlatives, ratings and track-record numbers (B8.1, B8.2, G11).
    id: "qa-superlatives", ref: "QA 18 Nov §2A superlatives; Answers B8.1, B8.2",
    find: /\bbest (team|crew|service|junk|company|in (the )?town|in the gta|in toronto)\b|\bbiggest city\b|\bmost (recommended|trusted|reliable|affordable|experienced|professional)\b|\brecommend\b[^.]{0,40}\bmore than any other\b|#1\b|\bnumber one\b|\bhundreds of\b|\bthousands of\b|\b\d{3,}\+?\s?(jobs|clients|projects|customers|homes|removals|pickups)\b|\b(5|five)[- ]star (rated|service|junk|crew|company)\b|\btop[- ](choice|rated)\b|\bhighest[- ]rated\b|\bdozens of (times|jobs|projects)\b/i,
    clause: [
      [/\bLocally Trusted\s*[–—-]\s*(A |The )?(5|Five)[- ]Star Rated\s+/gi, ""],
      [/\b(A |The )?(5|Five)[- ]Star Rated\s+/gi, ""],
      [/\bThe Best\s+(?=[A-Z])/g, ""],
      [/^Best\s+(?=[A-Z])/, ""],
    ],
    short: "",
    drop: true,
  },
  {
    // Permits: only the approved B5.9 sentence.
    id: "qa-permits", ref: "QA 18 Nov §2A specialist; Answers B5.9",
    skip: ["faq.q"], // a customer question is fine as asked; its answer is what gets checked
    // the noun only: "where building rules permit" / "time permitting" are not about permits
    find: /\bpermits\b|\bpermit (requirements?|applications?|approvals?|fees?|is|are|for|from|needed|required|process|handling)\b|\b(a|the|any|building|demolition|municipal|city|town|required|necessary) permits?\b/i,
    unless: /\bpermit requirements?, where applicable, must be confirmed\b|\bwho arranges them is agreed\b|\{\{fact:permits\}\}|\b(rules|time|weather|space|access|budget|schedule|conditions) permits?\b/i,
    replaceWith: "{{fact:permits}}",
    short: "",
    drop: true,
  },
  {
    // Structural / foundation / attached demolition (B5.10, Manisha follow-up).
    id: "qa-structural", ref: "QA 18 Nov §2A specialist; Answers B5.10, B5.12; Manisha 18 Nov",
    skip: ["faq.q"], // a customer question is fine as asked; its answer is what gets checked
    find: /(?<!non-)\bstructural\b|\bfoundations?\b|\bfootings?\b|\bblock walls?\b|\battached garages?\b|(?<!non-)\bload-bearing\b|\bconcrete pool decks?\b/i,
    unless: /\b(doesn['’]t|does not|don['’]t|do not|won['’]t|never)\b[^.]{0,40}\bstructural|\bsubject to assessment\b|\bisn['’]t guaranteed\b|\bassessed based on site conditions\b|\bstructural (concerns?|damage|issues?|problems?|integrity|safety)\b[^.]{0,60}\b(flag|specialist|professional|licensed|engineer|decline|tell us|disclose)|\bfoundation of (any|every|our|a|the)\b/i,
    clause: [[/,?\s*(and )?concrete pool decks?\b/gi, ""]],
    replaceWith: "{{fact:structuralDemolition}}.",
    short: "",
    drop: true,
  },
  {
    // Specialist equipment and site work (B5.10, B5.11, B5.16).
    id: "qa-equipment", ref: "QA 18 Nov §2A specialist; Answers B5.10, B5.11, B5.16",
    skip: ["faq.q"], // a customer question is fine as asked; its answer is what gets checked
    find: /\bmachinery\b|\bracking\b|\b(industrial )?breakers?\b(?![^.]{0,30}\b(panel|switch|off)\b)|\b(concrete |circular |reciprocating |cut-off )?saws\b|\bjackhammers?\b|\bexcavat|\bdust suppression\b|\bsite restoration\b|\bgrading\b|\bslabs?\b/i,
    unless: /\bassessed based on site conditions\b|\bconfirmed at the onsite estimate\b|\baren['’]t promised\b|\b(circuit|electrical) breakers?\b|\bturn (off|the power off)\b[^.]{0,30}\bbreaker|\bbreaker (panel|box|switch)\b/i,
    replaceWith: "{{fact:equipmentScope}}.",
    short: "",
    drop: true,
  },
  {
    // Disconnection, draining and pumping as our job (B5.5–B5.7): the customer / a qualified person prepares.
    id: "qa-utilities", ref: "QA 18 Nov §2A specialist; Answers B5.5–B5.7",
    skip: ["faq.q"], // a customer question is fine as asked; its answer is what gets checked
    find: /\bdisconnect(s|ed|ion|ions|ing)?\b|\bdrain(s|ed|ing)?\b|\bpump(s|ed|ing)?\b|\brefrigerants?\b|\bfreon\b/i,
    unless: /\b(we|live junk free) (don['’]t|do not|can['’]t|cannot|won['’]t|never) (disconnect|drain|pump)|\b(ask|asks|asking) (that|you to|for)\b[^.]{0,60}\b(disconnect|drain)|\b(must|should|needs? to|has to|have to|please)\b[^.]{0,60}\b(disconnect|drain|switch(ed)? off|isolat|arrange)[^.]{0,80}\b(qualified|licensed|electrician|plumber|tradesperson|you|before (pickup|we arrive|removal))|\b(unplugged|disconnected|drained|empty)\b[^.]{0,20}\b(and|or)\b[^.]{0,20}\b(unplugged|disconnected|drained|empty)\b|\bdrainage\b|\balready (drained|disconnected|unplugged)\b/i,
    replaceWith: "{{fact:utilityDisconnection}}",
    short: "",
    drop: true,
  },
  {
    // Bed bug containment / sealing / compliance and disposal-channel claims (B7.1, R3).
    id: "qa-handling", ref: "QA 18 Nov §2A handling; Answers B7.1, B4.2",
    skip: ["faq.q"], // a customer question is fine as asked; its answer is what gets checked
    find: /\bbagged and contained\b|\bsealed\b|\bencase(d|ment|ments)?\b|\bcontain(ed|ment)\b|\bpest[- ]free\b|\bsteriliz|\bsterilis|\bdisinfect|\b(toronto|municipal|health|city) (guidelines?|regulations?)\b|\bcomplian(t|ce)\b|\blicensed (disposal )?(channels|facilit\w*|partners)\b/i,
    unless: /\b(licensed pest[- ]control|pest[- ]control professional)/i,
    replaceWith: "",
    short: "",
    drop: true,
  },
  {
    // Kept belongings / valuables handled for the customer (B6.3).
    id: "qa-retained", ref: "QA 18 Nov §2A handling; Answers B6.1, B6.3",
    skip: ["faq.q"], // a customer question is fine as asked; its answer is what gets checked
    find: /\bloaded for delivery\b|\bdeliver(y|ed|ies)?\b[^.]{0,40}\b(kept|retained|keep|your) (items|belongings|things)\b|\b(kept|retained) (items|belongings)\b[^.]{0,40}\bdeliver|\bvaluables\b/i,
    // the customer setting valuables aside is the approved guidance (B6.1, B6.3), not our promise
    unless: /\b(set aside|separate|remove|keep|mark|identify|take out|put away)\b[^.]{0,50}\bvaluables|\bvaluables\b[^.]{0,50}\b(aside|before (we|the crew|removal|pickup))|\?\s*$/i,
    replaceWith: "{{fact:retainedItems}}",
    short: "",
    drop: true,
  },
  {
    // Local presence (B8.4, B8.5).
    id: "qa-local", ref: "QA 18 Nov §2A local; Answers B8.4, B8.5",
    find: /\bbased (in|right here in)\b|\b(our|local) representatives?\b|\brepresentatives? (in|based|located)\b|\blocal (office|crew|team|representatives?|branch|depot|yard)\b|\b[Oo]ur [A-Z][a-z]+ (office|branch|depot)\b|\b(head ?quartered|located) in\b/,
    clause: [[/\b(our )?local (crew|team)\b/gi, (m, o, w) => `${o ?? ""}${w}`]],
    short: "",
    drop: true,
  },
  {
    id: "hours", ref: "Answers B2.3",
    find: /\b6\s?(AM|am)\s*(to|–|-|and)\s*11\s?(PM|pm)\b|\b(7|seven) days a week\b|\b6\s?AM starts\b|\bevening slots\b|24\/7 scheduling|weekends and evenings with emergency/i,
    clause: [
      // only a trailing ", seven days a week, 6AM to 11PM" clause is cut; any other hours sentence is dropped
      [/,\s*(7|seven) days a week,?\s*(from\s+)?6\s?(AM|am)\s*(to|–|-)\s*11\s?(PM|pm)(?=\s*[.!?]|\s*$)/gi, ""],
      [/,\s*(from\s+)?6\s?(AM|am)\s*(to|–|-)\s*11\s?(PM|pm)(?=\s*[.!?]|\s*$)/gi, ""],
      [/,\s*(7|seven) days a week(?=\s*[.!?]|\s*$)/gi, ""],
    ],
    short: "{{fact:nextAvailable}}",
    drop: true,
    faqA: "{{fact:sameDay}}.",
  },
  {
    id: "promotions", ref: "Answers B1.2",
    find: /multi-?service (discounts?|savings)|save when bundling|discounts? when you (book|combine|bundle)|volume discounts?|bulk (discounts?|pricing|rates?)|multi-?(unit|location|site|item) (discounts?|savings|rates?|pricing)|discounts? for (multiple|bulk|recurring|multi)|price[- ]match|special project rates|preferred rates|bundle (deals?|discounts?|savings?|them)|better rate|reduced combined|combined (rate|savings)|pair[- ]and[- ]save|significant discounts/i,
    short: "{{fact:competitorComparison}}",
    drop: true,
  },
  {
    id: "after-hours", ref: "Answers B2.2",
    find: /no (extra|additional|premium) (charge|fee|cost|pricing)s? (for|on) (evenings?|weekends?|after-hours|holidays)|same price (on|for|at) (evenings?|weekends?|nights?|holidays)|(evening|weekend|after-hours|overnight|holiday)(,| and| &| or)? ?(and |& |or )?(weekend |holiday )?(service|appointments|cleanouts?|pickups?|removals?|work|jobs) (is |are )?(available|offered|at no)|we (also )?offer (evening|weekend|after-hours|overnight)/i,
    short: "Ask about available pickup times",
    drop: true,
  },
  {
    id: "instant-quote", ref: "Answers B1.3",
    find: /instant (quotes?|pricing|prices?|estimates?)|firm (price|quote|number) from (your )?photos|(quote|price)s? (from photos )?in minutes|binding quote from photos|exact price from (a )?photos?|upfront price right away|(quote|estimate|respond|response|get back to you|solution)[^.]{0,40}within minutes|no onsite visit required/i,
    replaceWith: "{{fact:freeOnsiteEstimates.long}}",
    clause: [
      [/\bInstant quotes? (available )?(via|by) (text|phone|text or phone|phone or text)/gi, "Send photos by text for a faster estimate"],
      [/we(['’]ll| will) give you an upfront price right away/gi, "we'll review your items and pickup details"],
    ],
    short: "{{fact:freeOnsiteEstimates}}",
    drop: true,
  },
  {
    id: "canada", ref: "Answers B8.4",
    find: /across Canada|throughout Canada|all over Canada|(cities|communities) (in|across) Canada|people of the Canada|in Canada\b/i,
    clause: [
      [/Trusted by people of the Canada/g, "Trusted across Toronto and the GTA"],
      [/\b(various )?(cities|communities) (in|across) Canada/gi, "communities across Toronto and the GTA"],
      [/\b(across|throughout|all over) Canada\b/gi, "across Toronto and the GTA"],
    ],
  },
  {
    id: "same-day", ref: "R2, G02, OBS-13, OBS-26, OBS-45, OBS-53, OBS-131, OBS-135, OBS-138, QA 18 Nov",
    find: /\b(same|next)[- ]day\b/i,
    skip: ["faq.q"],
    clause: [
      [/Book before noon and we['’]re there the same day\.?/gi, ""],
      [/Book before noon and we are there the same day\.?/gi, ""],
      [/\bNo waiting, no delays\.?/gi, ""],
    ],
    qualify: true,
  },
  {
    id: "review-counts", ref: "OBS-64, OBS-133, Part 2 B-8 #1",
    find: /\b\d[\d,]*\+?\s*(satisfied|happy) (customers|clients)|\b\d{3,4}(,\d{3})?\+?\s*(five-star|5-star|google|customers)|more than \d{3} five-star|by \d{3}\+? customers/i,
    short: "{{fact:reviews}}",
    clause: [
      [/Rated 5\.0 on Google by \d{3}\+? customers/gi, "{{fact:reviews}}"],
      [/★★★★★\s*\d{3}\+?\s*Five-Star (Live Junk Free )?(Google )?Reviews( on Google)?/gi, "★★★★★ Live Junk Free Reviews on Google"],
      [/\b(More than|Over)\s+\d{3}(,\d{3})?\s+five-star Google reviews/gi, "Google reviews"],
      [/★★★★★\s*\d{3}\+?\s*Five-Star ([\w ]{0,30}?)Reviews on Google/gi, "★★★★★ $1Reviews on Google"],
      [/\b\d{3,4}(,\d{3})?\+?\s*(five-star|5-star)\s+(Google\s+)?(reviews|ratings)/gi, "Google reviews"],
      [/\b\d{3}(,\d{3})?\+?\s+Google reviews/gi, "Google reviews"],
      [/\bby \d{3}\+? customers\b/gi, ""],
      [/\b(With )?(more than|over) \d[\d,]*\+? (happy|satisfied) (clients|customers),\s*(\w)/g, (_m, _w, _o, _h, _c, n) => n.toUpperCase()],
    ],
    drop: true,
  },
  {
    id: "superlatives", ref: "OBS-136, OBS-142, OBS-60",
    find: /more than any other|most recommended|best team in|biggest city|#1 (junk|rated)|number one (junk|rated)|the most efficient, fast-moving city/i,
    drop: true,
    short: "",
  },
  {
    id: "lone-prices", ref: "G01, OBS-12, OBS-17, OBS-57, OBS-62, OBS-115, OBS-137, OBS-140",
    // LJF service prices that are not confirmed. Third-party figures in blog posts (bin rental, landfill rates, fines) are not touched.
    find: /\{\{cad_(265|249|255|225|655|20)(:\w+)?\}\}|\$\s?200\s*[–-]\s*\$?\s?500|\{\{min_price(:\w+)?\}\} per appliance|\$125 per appliance/,
    clause: [[/\s*[—–-]?\s*\bSAVE \{\{cad_20\}\}!\s*/g, " "]],
    short: "Priced at your free onsite estimate",
    drop: true,
    faqA: "{{fact:quoteText}}",
  },
];

// Exact one-off fixes listed in the audit (G03, G04, G07) — applied wherever they occur.
const EXACT = [
  ["Fully Licensed Is Insured", "Fully Licensed & Insured", "typo"],
  ["Careful, Protected Removal", "Careful Removal", "Answers B3.3"],
  // left behind when the 30–50% clause was cut from this card title
  [/^Independent pricing runs$/, "{{fact:competitorComparison}}", "Answers B1.1"],
  // an earlier same-day pass matched "service" inside "services"
  [/\bservice when availables\b/g, "services when available", "typo"],
  // older same-day pass put the qualifier inside the noun phrase: "same-day garage cleanout when available services"
  [/\bwhen available (services?|removals?|pickups?|cleanouts?|appointments?|options)\b/g, "$1 when available", "word order"],
  // load-bearing wall copy pasted onto the TV and wall-unit pages (structural work isn't offered universally; Manisha 18 Nov)
  ["Book Your Load-Bearing Wall Removal Now", "Book Your TV Removal Now", "copy error", /tv-removal/],
  [/Load-Bearing Walls? Removal/g, "Wall Unit Removal", "copy error", /wall-unit/],
  ["Book Your Load-Bearing Wall Removal Now", "Book Your Wall Unit Removal Now", "copy error", /wall-unit/],
  [/\bOur full-service wall removal includes/g, "Our wall unit removal can include", "copy error", /wall-unit/],
  [/\s*[—–-]\s*nothing more$/, "", "Answers A1.4"],
  [/(\s*[—–-]\s*|,?\s+and\s+)there['’]s no extra charge just because [^.]*/g, "", "Answers A1.7"],
  [/,\s*at no (extra|additional) (charge|cost)(?=\.)/g, "", "Answers A1.7, B2.2"],
  ["Book Your Scrap Metal Now", "Request a Piano Removal Quote", "OBS-69", /piano/],
  ["Book Your Ward Tank Removal Now", "Request a Water Tank Removal Quote", "OBS-88"],
  ["Ward Tank", "Water Tank", "OBS-88"],
  ["Book Your Apartment Cleanout", "Book Your Basement Cleanout", "OBS-30", /basement/],
  ["Satisfied Custom​", "Satisfied Customers", "OBS-16"],
  [/Satisfied Custom\b(?!er)/g, "Satisfied Customers", "OBS-16"],
  [/Maintains the same environmental focus while adapting perfectly for appliance removal services\s*[–-]\s*keeps the same structure\.?/g, "", "OBS-63"],
  [/Professional Swing Set demolition/gi, "Professional Concrete Demolition", "OBS-127", /concrete/],
  [/Garage Demolition Before & After Gallery/g, "Shed Demolition Before & After Gallery", "OBS-113", /shed-demolition/],
  [/eco-friendly junk removal Ajax/gi, "eco-friendly junk removal in Brampton", "OBS-146", /brampton/],
];

// Copied hoarding text on other services' pages (G03, R8, OBS-03, OBS-149): use the page's own service.
const SERVICE_OF_FILE = [[/apartment/, "apartment"], [/estate/, "estate"], [/basement/, "basement"], [/house-cleanout/, "house"], [/storage-unit/, "storage unit"], [/garage-cleanout/, "garage"]];
function fileService(file) {
  if (/hoard/.test(file)) return null;
  return SERVICE_OF_FILE.find(([re]) => re.test(file))?.[1] ?? null;
}
const HOARDING_COPY = [
  [/\bHOW OUR HOARDING CLEANOUT WORKS\b/g, (svc) => `HOW OUR ${svc.toUpperCase()} CLEANOUT WORKS`],
  [/^Hoarding cleanouts are just one part of what we do\./, (svc) => `${svc.charAt(0).toUpperCase() + svc.slice(1)} cleanouts are just one part of what we do.`],
];

// ---------------------------------------------------------------- engine
const counts = Object.fromEntries([...RULES.map((r) => [r.id, { ref: r.ref, before: 0, after: 0, changedStrings: 0 }]), ["exact", { before: 0, after: 0, changedStrings: 0 }], ["min-price-token", { before: 0, after: 0, changedStrings: 0 }], ["price-scope", { ref: "Answers A1.3, A1.5, A1.6", before: 0, after: 0, changedStrings: 0 }], ["links", { before: 0, after: 0, changedStrings: 0 }]]);
const changedFiles = new Map();

// The QA (18 Nov) accepts same-day / next-day / weekend wording only with one of these qualifiers in the
// same sentence (scripts/checks/claims-patterns.json → timing.allow). Older looser words ("most", "can",
// "often", "available") no longer count.
const STRICT = /\b(subject to (availability|scheduling)|may be available|depending on (the job|scheduling|availability|location|crew)|when available|where available|if available|crew availability|ask (our team|us) about|can['’]t (promise|guarantee)|not guaranteed)\b/i;
const DAY = /\b(same|next)[- ]day\b/i;
const NOUN = String.raw`(\s+([a-z][a-z-]+\s+){0,2}?(pickups?|services?|removals?|appointments?|slots?|haul[- ]away|cleanouts?|completion|availability|booking|visits?|jobs?|demolition|options|scheduling|clear-?outs?)(\s+(services?|pickups?|options|appointments?|slots?))?(?![a-z]))`;
const PHRASE = new RegExp(String.raw`\b(same|next)[- ]day((\s+(or|and|&)\s+(same|next)[- ]day)?${NOUN}?)`, "i");
// "Same-day available", "same-day and next-day services are available" → "… may be available"
const AVAIL = new RegExp(String.raw`(\b(same|next)[- ]day((\s+(or|and|&)\s+(same|next)[- ]day)?${NOUN}?))(\s+(is|are))?\s+(now\s+)?available\b`, "gi");

function qualifySameDay(s, kind) {
  if (!DAY.test(s)) return s;
  // "… with same-day options available" → "… options when available" (grammar); otherwise "may be available"
  const fix = (x) => x.replace(AVAIL, (...m) => { const ph = m[1], at = m[m.length - 2], str = m[m.length - 1]; return /\bwith\s+$/i.test(str.slice(0, at)) ? `${ph} when available` : `${ph} may be available`; });
  // Short labels / headings / titles.
  if (isShort(s) || (/^(h\.text|h1|title|seo\.title|eyebrow|.*\.title|ctas\..*)$/.test(kind) && s.length <= 140 && !/[.!?]\s+\S/.test(s))) {
    if (STRICT.test(s) || /\?\s*$/.test(s)) return s;
    const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
    let t = fix(s);
    if (STRICT.test(t)) return tidy(t);
    t = t
      .replace(/,?\s*(the\s+)?same[- ]day$/i, "") // "Your Yard Is Clear the Same Day" → outcome without the promise
      .replace(/\|\s*Same[- ]Day( Pickup| Service)?\s*(?=[|–-])/i, "| Free Onsite Estimates ");
    // A leading "Same-Day …" adjective on a heading / title: drop it, unless that leaves a bare word.
    const lead = t.match(/^(\W*)(Same|Next)[- ]day\s+((or|and|&)\s+(same|next)[- ]day\s+)?(.+)$/i);
    if (lead && lead[6].split(/\s+/).length >= 2) t = lead[1] + cap(lead[6]);
    t = t.replace(/(\S)\s+(Same|Next)[- ]Day\s+(?=[A-Z])/g, "$1 ").replace(/\b(same|next)[- ]day\s+(?=(estimates?|quotes?|pricing)\b)/gi, "");
    // Anything left: qualify the phrase in place.
    if (DAY.test(t)) t = t.replace(PHRASE, (m) => `${m} when available`);
    return tidy(t) || s;
  }
  // Long text: qualify each unqualified sentence once.
  return s
    .split(SENT)
    .map((sent) => {
      if (!DAY.test(sent) || STRICT.test(sent) || /\?\s*$/.test(sent)) return sent;
      const f = fix(sent);
      if (STRICT.test(f)) return f;
      const m = f.match(PHRASE);
      if (m && m[2] && new RegExp(NOUN, "i").test(m[2])) return f.replace(m[0], `${m[0]} when available`);
      // a fragment (text before an inline link has no full stop): a bracketed qualifier, never a new sentence end
      if (!/[.!?]\s*$/.test(f)) return `${f.replace(/\s+$/, "")} (subject to availability)${/\s$/.test(f) ? " " : ""}`;
      return f.replace(/([.!?])\s*$/, (e, p) => `, subject to availability${p}`);
    })
    .join(" ");
}

// A sentence-level exemption: `unless` keeps sentences that match `find` but are benign
// (e.g. "estimates are free of charge" for the no-extra-charge rule).
function ruleHits(rule, re, x) {
  if (!re.test(x)) return false;
  if (!rule.unless) return true;
  return x.split(SENT).some((y) => re.test(y) && !rule.unless.test(y));
}

function applyRule(rule, s, kind) {
  if (rule.skip?.some((k) => kind === k || kind.endsWith("." + k))) return s;
  if (!ruleHits(rule, rule.find, s)) return s;
  let t = s;
  if (!rule.clauseShortOnly || isShort(t)) for (const [re, rep] of rule.clause ?? []) t = t.replace(re, rep);
  if (rule.transform) t = rule.transform(t, kind);
  if (rule.qualify) t = qualifySameDay(t, kind);
  const still = rule.dropIf ?? rule.find;
  const hit = (x) => ruleHits(rule, still, x);
  // An H1 is never emptied or replaced by a label (QA new defect B1-44): only the offending phrase is cut.
  // If nothing usable is left, the original stays and the page linter flags it for a page-specific fix.
  if ((kind === "h1" || kind === "h1.text" || /^cards\.title$/.test(kind)) && hit(t)) {
    const cut = tidy(t.replace(new RegExp(still.source, still.flags.includes("g") ? still.flags : still.flags + "g"), " ").replace(/\s*[–—-]\s*(?=[–—-]|$)/g, "").replace(/^\W+|[\s,–—-]+$/g, ""));
    if (cut.split(/\s+/).length >= 2) return cut;
    // A card title that is nothing but the claim ("Multi-Bed & Landlord Rates"): empty it, and cleanStructure
    // removes the whole card. H1s keep the original for a page-specific fix.
    return kind === "cards.title" ? "" : s;
  }
  if (rule.faqQ && kind === "faq.q" && hit(t)) return rule.faqQ;
  if (!hit(t)) return tidy(t);
  if (rule.faqA && kind === "faq.a" && t.split(SENT).every((x) => hit(x))) return rule.faqA;
  // An FAQ question with no approved replacement question: drop the whole item (walk() removes it),
  // never turn the question into a label like "Transparent, upfront pricing" over an answer like "Never.".
  if (kind === "faq.q" && isShort(t) && rule.short !== undefined) return "";
  // A question-style heading keeps a question (its answer follows it on the page).
  if (isShort(t) && rule.short !== undefined) return rule.faqQ && /\?\s*$/.test(t) ? rule.faqQ : rule.short;
  if (rule.drop) {
    // replaceWith: the first offending sentence becomes the approved wording, later ones are dropped.
    let used = false;
    const kept = t.split(SENT).flatMap((x) => {
      if (!hit(x)) return [x];
      if (REPLACE_LOG) REPLACE_LOG.push([rule.id, kind, rule.replaceWith && !used ? rule.replaceWith : "(dropped)", x]);
      return rule.replaceWith && !used && !/^(h|h1|eyebrow)\.text$/.test(kind) ? ((used = true), [rule.replaceWith]) : [];
    });
    if (!kept.length) return rule.short ?? "";
    return tidy(kept.join(" "));
  }
  return tidy(t);
}

// Camera-filename / timestamp alt text (e.g. "20250405_142357", "DSC08963", "IMG 1614 scaled") → a
// description from the page's service (audit A7, OBS-17 media notes, M5). Photos are not re-captioned
// individually until the Drive assets are reviewed (MEDIA-NEEDED.md).
const BAD_ALT = /^(\d{6,}[_ -]?\d*|\d{8}|(IMG|DSC|PXL|DJI|MVIMG|WhatsApp Image|Screenshot)[\w .-]*|[\w-]+\.(jpe?g|png|webp))([\s-]+scaled(\s+\d+)?|\s*\(\d+\)|\.(jpe?g|png|webp))?$/i;
let currentTitle = "";
function altFor(s) {
  const svc = currentTitle.replace(/\s*[-|–].*$/, "").replace(/\bServices?\b/g, "").replace(/\s{2,}/g, " ").trim();
  const which = /\bbefore\b/i.test(s) ? "Before" : /\bafter\b/i.test(s) ? "After" : "";
  return `${which ? which + ": " : ""}${svc || "Junk removal"}: Live Junk Free job photo`;
}

// Answers A1.3 / A1.5 / A1.6: "from C$125" is the 1/16 standard Junk Load only. Pages for services the
// rate card doesn't price (cleanouts, demolition, bed bug, specialist items, commercial specialist work)
// show the quote wording instead of the minimum.
const NO_MIN_PRICE = /cleanout|clean-out|clearout|hoarding|estate|eviction|foreclosure|bereavement|downsizing|attic|storage-unit|demolition|bed-bug|hot-tub|jacuzzi|mattress|box-spring|appliance|fridge|refrigerator|freezer|washer|dryer|stove|oven|dishwasher|microwave|e-waste|ewaste|electronics|computer|monitor|piano|water-tank|water-heater|carpet|shed|business|warehouse|retail|office|property-management|restaurant|construction|renovation|landing/;
const priceAllowed = (file) => !NO_MIN_PRICE.test(file.replace(/^content\/(pages|blog)\//, "").replace(/^locations\/[^/]+\/(?=[^/]+$)/, ""));
const QUOTE = "{{fact:quoteText}}";
function scopePrice(t, kind, file) {
  if (!/\{\{min_price/.test(t)) return t;
  if (priceAllowed(file)) {
    if (kind === "price.value") return "Junk Load from {{min_price:C}}";
    return t
      .replace(/(\s*for a 1\/16 Junk Load \(1 cubic yard\))+/g, " for a 1/16 Junk Load (1 cubic yard)")
      .replace(/(\{\{min_price(?::\w+)?\}\})\s+for (small|smaller|single-item|minimum) (loads?|jobs?|pickups?|removals?)/gi, "$1 for a 1/16 Junk Load (1 cubic yard)")
      .replace(/\{\{min_price(:suffix)?\}\}/g, "{{min_price:C}}");
  }
  counts["price-scope"].before++;
  if (kind === "price.value" || isShort(t)) return /^\s*\{\{min_price/.test(t) || kind === "price.value" ? "Contact us for a quote" : "Contact us for a quote";
  const kept = t.split(SENT).filter((x) => !/\{\{min_price/.test(x));
  return kept.length ? tidy(kept.join(" ")) : QUOTE;
}

function fixString(s, kind, file) {
  if (typeof s !== "string" || !s.trim()) return s;
  if (/(^|\.)alt$/.test(kind) && BAD_ALT.test(s.trim())) { counts.exact.before++; return altFor(s); }
  let t = s;
  // Price-block label ending in "From" / "Starts From", e.g. "Ajax Basement Cleanout Services Starts From"
  // (value is now "Contact us for a quote" or "Junk Load from C$125") → "Ajax Basement Cleanout Pricing" (A1.3 / A1.6).
  if (kind === "price.label") {
    const l = t.replace(/(\s+Services?)?\s+(Starts?|Starting|Prices? Starts?|Prices? Starting)?\s*(From|at)(\s+(just|only))?\s*:?\s*$/i, "");
    if (l !== t) { counts["price-scope"].before++; t = /pricing$/i.test(l) ? l : `${l} Pricing`; }
  }
  // {{cad_125}} → {{min_price}} (minimum comes from business-facts.json) + qualify whole-job wording.
  if (/\{\{cad_125(:\w+)?\}\}/.test(t)) {
    counts["min-price-token"].before++;
    t = t.replace(/\{\{cad_125(:\w+)?\}\}/g, (_m, f) => `{{min_price${f ?? ""}}}`);
  }
  // $125 typed directly into page text (not the token) → the same token, so price-scope applies to it too.
  t = t.replace(/(?<![\d.$])C?\$\s?125(\.00)?(?!\d|[.,]\d)/g, () => "{{min_price}}");
  // $99 / $75 (outdated minimums, OBS-12 / 137 / 140) → the confirmed minimum.
  t = t.replace(/(?<![\d.])\$\s?(99|75)(\.00)?(?!\d|[.,]\d)/g, () => "{{min_price}}");
  t = t
    .split(SENT)
    .map((sent) =>
      /\{\{min_price/.test(sent) && !/small|single|minimum|min\b|one item|smallest|starting price|lowest|Junk Load|1\/16|cubic yard/i.test(sent)
        ? sent.replace(/(\b(?:start(?:s|ing)? (?:at|from)|from|only|just)\s+(?:just\s+)?)(\{\{min_price(?::\w+)?\}\})/i, "$1$2 for small loads")
        : sent,
    )
    .join(" ");
  for (const [find, rep, , onlyIn] of EXACT) {
    if (onlyIn && !onlyIn.test(file)) continue;
    const hit = typeof find === "string" ? t.includes(find) : (find.lastIndex = 0, find.test(t));
    if (hit) {
      counts.exact.before++;
      t = typeof find === "string" ? t.split(find).join(rep) : t.replace(find, rep);
    }
  }
  if (/^\s*-\s+\w/.test(t) && /^(h\.text|h1|eyebrow)$/.test(kind)) t = t.replace(/^\s*-\s+/, ""); // OBS-113 stray hyphen
  const svc = fileService(file);
  if (svc) for (const [re, rep] of HOARDING_COPY) if ((re.lastIndex = 0, re.test(t))) { counts.exact.before++; t = t.replace(re, rep(svc)); }
  for (const rule of RULES) {
    if (ruleHits(rule, rule.find, t)) counts[rule.id].before++;
    t = applyRule(rule, t, kind);
  }
  t = scopePrice(t, kind, file);
  if (t !== s && /^\s*[A-Z]/.test(s) && /^\s*[a-z]/.test(t)) t = t.replace(/^(\s*)([a-z])/, (_m, w, c) => w + c.toUpperCase());
  return t === s ? s : keepEdges(s, t) || (s.match(/^\s/) ? " " : "");
}

const LINK_FIX = [
  [/^https?:\/\/(www\.)?livejunkfree\.ca\.com\/?/i, "/services/"],
  [/^https?:\/\/[^/]*hostingersite\.com/i, ""],
];

// Answers B8.2: no numeric counters (years, jobs, clients, service types, "100% satisfaction", star rating).
const COUNTER = /years?\s+(of\s+)?experience|service types|satisfaction|star rated|rated service|happy (clients|customers)|jobs (done|completed)|services completed|customers served/i;

function walk(node, kind, file, parentT) {
  const numericCard = (it) => it && typeof it === "object" && /^\s*([\d,.]+\s*\+?\s*%?|\d+\s*Star)\s*$/i.test(String(it.title ?? ""));
  if (node && typeof node === "object" && !Array.isArray(node) && node.t === "cards" && Array.isArray(node.items) && node.items.some(numericCard)) {
    const before = node.items.length;
    node = { ...node, items: node.items.filter((it) => !(numericCard(it) && COUNTER.test(JSON.stringify(it)))) };
    if (node.items.length !== before) counts.exact.before++;
  }
  if (node && typeof node === "object" && !Array.isArray(node) && node.t === "stats" && Array.isArray(node.items)) {
    const before = node.items.length;
    node = { ...node, items: node.items.filter((it) => !COUNTER.test(JSON.stringify(it))) };
    if (node.items.length !== before) counts.exact.before++;
  }
  if (Array.isArray(node)) {
    const out = [];
    for (const x of node) {
      const v = walk(x, kind, file, parentT);
      // An FAQ item whose question a rule removed (or left as a bare fact label) goes entirely.
      if (x && typeof x === "object" && typeof x.q === "string" && v && typeof v.q === "string" && (!v.q.trim() || /^\s*\{\{fact:[\w.]+\}\}\.?\s*$/.test(v.q))) { counts.exact.before++; continue; }
      // Drop list items / inline strings emptied by a rule.
      if (v === "" && (kind === "ul.items" || kind === "checks.items")) continue;
      if (Array.isArray(v) && v.length === 0 && (kind === "ul.items" || kind === "checks.items")) continue;
      out.push(v);
    }
    return out;
  }
  if (typeof node === "string") return fixString(node, kind, file);
  if (node && typeof node === "object") {
    const o = {};
    const t = node.t ?? parentT;
    for (const [k, v] of Object.entries(node)) {
      if (k === "src" || k === "path" || k === "canonical" || k === "ogImage" || k === "id" || k === "t" || k === "kind" || k === "type" || k === "template") {
        o[k] = v;
        continue;
      }
      if (k === "alt" && typeof v === "string") {
        o[k] = fixString(v, "alt", file);
        continue;
      }
      if ((k === "a" && typeof v === "string") || k === "href") {
        let h = v;
        for (const [re, rep] of LINK_FIX) if (typeof h === "string" && re.test(h)) { counts.links.before++; h = h.replace(re, rep) || "/"; }
        o[k] = h;
        continue;
      }
      const kk = kind === "seo" ? `seo.${k}` : k === "seo" ? "seo" : node.t === "h" && node.l === 1 ? `h1.${k}` : node.t ? `${node.t}.${k}` : kind === "root" ? k : /^(q|a|title|text|label)$/.test(k) && parentT ? `${parentT}.${k}` : kind;
      o[k] = walk(v, kk, file, t);
    }
    // A "Call us now"-style link that doesn't dial (OBS-69, OBS-88).
    if (typeof o.a === "string" && Array.isArray(o.c) && /call us( now)?|call now/i.test(JSON.stringify(o.c)) && !o.a.startsWith("tel:")) {
      counts.links.before++;
      o.a = "tel:+16479225865";
    }
    if (typeof o.href === "string" && typeof o.label === "string" && /^call( us)?( now)?\b/i.test(o.label) && !o.href.startsWith("tel:")) {
      counts.links.before++;
      o.href = "tel:+16479225865";
    }
    return o;
  }
  return node;
}

// QA 18 Nov new defects (empty cards, headings with no body, empty accordions): after the rules run, remove
// only elements that are actually empty, so a page never shows a blank card, heading or answer.
// Sections are never removed: on this site a section often holds just a heading, with its content in the
// next section.
const isEmpty = (v) => v == null || (typeof v === "string" && !v.trim()) || (Array.isArray(v) && v.every(isEmpty));
// Labels the rules write into headings (short replacements). A heading that is only one of these, directly
// followed by a heading of the same level, is a leftover with no body of its own.
const RULE_LABEL = /^\s*(\{\{fact:[\w.]+\}\}\.?|Careful Removal|Transparent, upfront pricing|Contact us for a quote|Ask about available pickup times)\s*$/i;
function cleanStructure(doc) {
  if (!doc || !Array.isArray(doc.sections)) return doc;
  let removed = 0;
  const keep = (cond) => { if (!cond) removed++; return cond; };
  for (const s of doc.sections) {
    if (!Array.isArray(s.blocks)) continue;
    for (const b of s.blocks) {
      if ((b.t === "cards" || b.t === "steps") && Array.isArray(b.items)) b.items = b.items.filter((it) => keep(!(it && typeof it === "object" && (("text" in it && isEmpty(it.text) && !it.image && !it.href && !it.label) || ("title" in it && isEmpty(it.title))))));
      if (b.t === "faq" && Array.isArray(b.items)) b.items = b.items.filter((f) => keep(!(typeof f.q === "string" && (!f.q.trim() || isEmpty(f.a)))));
      if ((b.t === "ul" || b.t === "ol" || b.t === "checks") && Array.isArray(b.items)) b.items = b.items.filter((x) => keep(!isEmpty(x)));
    }
    // An empty H1 gets the page's own name (QA new defect B1-44: Mississauga showed a blank hero heading).
    for (const b of s.blocks) if (b.t === "h" && b.l === 1 && isEmpty(b.text)) {
      const t = String(doc.title ?? "").trim();
      b.text = /\s/.test(t) ? t : `Junk Removal in ${t}`;
      if (isEmpty(doc.h1)) doc.h1 = b.text;
      removed++;
    }
    s.blocks = s.blocks.filter((b) => keep(!((b.t === "p" && isEmpty(b.c)) || (["cards", "steps", "faq", "ul", "ol", "checks"].includes(b.t) && Array.isArray(b.items) && !b.items.length) || (b.t === "h" && isEmpty(b.text)))));
    s.blocks = s.blocks.filter((b, i, arr) => b.t !== "h" || !RULE_LABEL.test(b.text) || !(i === arr.length - 1 || (arr[i + 1]?.t === "h" && arr[i + 1].l <= b.l) || ["cards", "steps"].includes(arr[i + 1]?.t)) || keep(false));
  }
  // The same approved sentence on its own (a whole paragraph / card text that is just one fact token) only once
  // per page; FAQ answers keep theirs.
  const seenTok = new Set();
  const lone = /^\s*(\{\{fact:[\w.]+\}\}\.?\s*)+$/;
  const dedupe = (v, key) => {
    if (typeof v === "string") {
      if (key !== "a" && key !== "q" && lone.test(v)) { if (seenTok.has(v.trim())) { removed++; return ""; } seenTok.add(v.trim()); }
      return v;
    }
    if (Array.isArray(v)) return v.map((x) => dedupe(x, key));
    if (v && typeof v === "object") { for (const k of Object.keys(v)) if (!/^(src|href|path|t|l|id)$/.test(k)) v[k] = dedupe(v[k], k === "c" || k === "text" || k === "items" ? key === "a" ? "a" : k : k); return v; }
    return v;
  };
  for (const s of doc.sections) if (Array.isArray(s.blocks)) for (const b of s.blocks) if (b.t !== "faq") dedupe(b, b.t);
  // emptied by the de-duplication
  for (const s of doc.sections) {
    if (!Array.isArray(s.blocks)) continue;
    for (const b of s.blocks) if ((b.t === "cards" || b.t === "steps") && Array.isArray(b.items)) b.items = b.items.filter((it) => !(it && typeof it === "object" && "text" in it && isEmpty(it.text) && !it.image && !it.href && !it.label));
    s.blocks = s.blocks.filter((b) => !((b.t === "p" && isEmpty(b.c)) || (["cards", "steps", "ul"].includes(b.t) && Array.isArray(b.items) && !b.items.length)));
  }
  if (removed) counts.exact.before += removed;
  return doc;
}

const files = [];
const scan = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) scan(p); else if (p.endsWith(".json")) files.push(p); } };
scan(join(ROOT, "content/pages"));
scan(join(ROOT, "content/blog"));

for (const f of files) {
  const raw = readFileSync(f, "utf8");
  const doc = JSON.parse(raw);
  currentTitle = doc.title || doc.h1 || "";
  const rel = f.slice(ROOT.length + 1);
  const next = cleanStructure(walk(doc, "root", rel, undefined));
  const out = JSON.stringify(next, null, (raw.match(/^\{\n( +)/) || [, " "])[1].length) + (raw.endsWith("\n") ? "\n" : "");
  if (out !== raw) {
    changedFiles.set(rel, true);
    if (!DRY) writeFileSync(f, out);
  }
}

// After-counts: re-scan what remains (on the written files, or the in-memory result when --dry).
function remaining(re, rule) {
  let n = 0;
  for (const f of files) {
    const raw = readFileSync(f, "utf8");
    const strs = [];
    const coll = (v, k, parent) => { if (typeof v === "string") { if (!/^(src|href|path|canonical|ogImage)$/.test(k) && !(k === "a" && parent && "c" in parent)) strs.push(v); } else if (Array.isArray(v)) v.forEach((x) => coll(x, k, parent)); else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) coll(x, kk, v); };
    coll(JSON.parse(raw), "");
    n += strs.filter((s) => (rule ? ruleHits(rule, re, s) : re.test(s))).length;
  }
  return n;
}
if (!DRY) {
  for (const r of RULES) {
    // same-day: count only unqualified sentences that remain.
    counts[r.id].after = r.id === "same-day"
      ? remainingUnqualifiedSameDay()
      : remaining(r.dropIf ?? r.find, r);
  }
  counts["min-price-token"].after = remaining(/\{\{cad_125/);
}
function remainingUnqualifiedSameDay() {
  let n = 0;
  for (const f of files) {
    const coll = (v, k) => {
      if (typeof v === "string") { if (k !== "q" && !/^(src|href|path)$/.test(k)) for (const s of v.split(SENT)) if (DAY.test(s) && !STRICT.test(s) && !/\?\s*$/.test(s)) n++; }
      else if (Array.isArray(v)) v.forEach((x) => coll(x, k));
      else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) coll(x, kk);
    };
    coll(JSON.parse(readFileSync(f, "utf8")), "");
  }
  return n;
}

const report = { generated: new Date().toISOString(), dryRun: DRY, filesScanned: files.length, filesChanged: changedFiles.size, rules: counts };
// Only a run that changed something rewrites the report (a no-op re-run keeps the batch's before/after counts).
if (!DRY && changedFiles.size) writeFileSync(join(ROOT, "docs/client/batch-1/content-rules-report.json"), JSON.stringify(report, null, 1) + "\n");
console.log(`scanned ${files.length} files, ${DRY ? "would change" : "changed"} ${changedFiles.size}`);
for (const [id, c] of Object.entries(counts)) console.log(id.padEnd(24), "before", String(c.before).padStart(5), " after", String(c.after).padStart(5));

if (REPLACE_LOG) writeFileSync(process.env.LJF_RULES_LOG, REPLACE_LOG.map((r) => r.map((x) => String(x).replace(/\s+/g, " ")).join("\t")).join("\n") + "\n");
