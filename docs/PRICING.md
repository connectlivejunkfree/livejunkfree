# Pricing

The exact figures come from Nav's rate card, approved in `docs/client/batch-1/LJF_Akshat_Point_by_Point_Answers_18_Nov_2026.pdf` (A1). All prices are in CAD.

| File | What it holds |
|---|---|
| `content/pricing.json` | **`junkLoad`**: 13 tiers (1/16 = 1 yd³ = $125 … Full = 16 yd³ = $655), labour note "1/2 Hour of Labour Included Per 1/4 Load." **`bedLoad`**: 7 tiers (1/6 = 0.5 yd³ = $195 … Full = 3 yd³ = $655), labour note "1 Hour of Labour Included Per 1/2 Load." |
| `content/business-facts.json` | `minimumPrice` ("Junk Load from C$125", 1/16 load), `fullLoadPrice` (C$655 for 16 yd³), `quoteText`, `pricingIntro`, `curbsideDiscount` |

Junk Load and Bed Load are **separate schedules**. They are not the same truck capacity, and Bed Load is **not** bed-bug pricing.

## Changing a price

1. Edit the `price`, `cubicYards` or `label` of a tier in `content/pricing.json`. Add or remove tiers freely; `fillPercent` sets how full the truck looks.
2. If the 1/16 minimum changes, also edit `minimumPrice.value` in `content/business-facts.json`.
3. Run `npm run build` and deploy.

## What updates automatically

- **The interactive truck** (`src/components/designed/sections/LoadMeter.tsx`): Junk Load / Bed Load modes, the selected fraction, cubic yards, price, the labour note for that schedule, the approved pricing wording, free onsite estimates, the 10% curbside note, Call and Get a quote. Get a quote passes the selection into the enquiry.
- **The designed pages' pricing sentences** (`content/designed/pricing.ts`).
- **Every `{{min_price}}` on standard junk-removal pages**, which reads "from C$125 for a 1/16 Junk Load (1 cubic yard)", and the JSON-LD Offer `minPrice` on those pages.

## Where no price is shown (Answers A1.3, A1.5, A1.6)

On services the card doesn't price, pages say **"Contact us for a quote based on the items, access and removal requirements."** That covers:
- cleanouts, demolition and bed bug pages
- hot tub, mattress / box spring, appliances, e-waste and computers, piano, water tank, carpet and shed pages
- business, office, warehouse and retail cleanout pages

This is enforced by `scripts/content-rules.mjs` (rule `price-scope`). Never write "House cleanouts from $125", "all demolition from $125", "all-inclusive", "no hidden fees", "tax included" or "free extra labour".

## Taxes and inclusions (Manisha, 18 Nov 2026)

"Displayed load rates exclude applicable taxes" (`taxNote`) shows under every displayed price: on the truck, on price blocks and in the schema Offer. Never write that disposal, fuel, labour or any other charge is included in a displayed rate. The `inclusions` rule removes that wording site-wide.

## The curbside discount

"10% off when the items to be removed are already placed at the curb or driveway. Ask our team to confirm offer eligibility." It's never a blanket or stackable discount (A1.8).
