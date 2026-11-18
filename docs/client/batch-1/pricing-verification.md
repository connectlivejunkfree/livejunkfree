# Pricing verification (QA 18 Nov §4)

**Result: all 20 displayed rates and both labour notes match Nav's rate card.** Checked 19 Nov 2026.

**Sources compared:**
- **Nav's rate card:** the tables in `LJF_Akshat_Point_by_Point_Answers_18_Nov_2026.pdf`, A1, "Pricing values approved for implementation", copied from Nav's rate-card image of 15 Nov 2026.
- **What the site uses:** `content/pricing.json`. It is the only place a rate is set. The truck, `{{min_price}}`, the "Junk Load from C$125" and "C$655 full load" sentences, and the schema `minPrice` all read their numbers from it.
- **What the QA captured:** the "Pricing Captured" sheet of `LJF_First50_Independent_QA_2026-11-18.xlsx`.

The check is automated as `scripts/checks/pricing-check.mjs` and is part of `npm run check:content`, so any future difference fails the check.

## Junk Load (13 sizes)

Labour note shown with this schedule only: **"1/2 Hour of Labour Included Per 1/4 Load."** It matches the card.

| Size | Cubic yards: card / site / QA | Price (CAD): card / site / QA | Result |
|---|---|---|---|
| 1/16 | 1 / 1 / 1 | 125 / 125 / 125 | ✓ |
| 1/8 | 2 / 2 / 2 | 155 / 155 / 155 | ✓ |
| 1/6 | 3 / 3 / 3 | 195 / 195 / 195 | ✓ |
| 1/4 | 4 / 4 / 4 | 265 / 265 / 265 | ✓ |
| 1/3 | 5 / 5 / 5 | 335 / 335 / 335 | ✓ |
| 3/8 | 6 / 6 / 6 | 385 / 385 / 385 | ✓ |
| 1/2 | 8 / 8 / 8 | 455 / 455 / 455 | ✓ |
| 5/8 | 10 / 10 / 10 | 515 / 515 / 515 | ✓ |
| 2/3 | 11 / 11 / 11 | 555 / 555 / 555 | ✓ |
| 3/4 | 12 / 12 / 12 | 595 / 595 / 595 | ✓ |
| 5/6 | 13 / 13 / 13 | 615 / 615 / 615 | ✓ |
| 7/8 | 14 / 14 / 14 | 635 / 635 / 635 | ✓ |
| Full | 16 / 16 / 16 | 655 / 655 / 655 | ✓ |

## Bed Load (7 sizes, a separate schedule)

Labour note shown with this schedule only: **"1 Hour of Labour Included Per 1/2 Load."** It matches the card.

| Size | Cubic yards: card / site / QA | Price (CAD): card / site / QA | Result |
|---|---|---|---|
| 1/6 | 0.5 / 0.5 / 0.5 | 195 / 195 / 195 | ✓ |
| 1/4 | 0.75 / 0.75 / 0.75 | 265 / 265 / 265 | ✓ |
| 1/3 | 1 / 1 / 1 | 335 / 335 / 335 | ✓ |
| 1/2 | 1.5 / 1.5 / 1.5 | 455 / 455 / 455 | ✓ |
| 2/3 | 2 / 2 / 2 | 555 / 555 / 555 | ✓ |
| 3/4 | 2.5 / 2.5 / 2.5 | 595 / 595 / 595 | ✓ |
| Full | 3 / 3 / 3 | 655 / 655 / 655 | ✓ |

## The same figures on the pages

| Page | Shows | Result |
|---|---|---|
| Home (truck) | The truck opens on 1/4 Junk Load: 4 cubic yards, C$265; every size changes the fill and the price | ✓ |
| How It Works | "Junk Load from C$125 (1/16 load, 1 cubic yard)" and "A full Junk Load (16 cubic yards) is C$655" | ✓ |
| Estate | The cleanout quote wording, no C$125 (Answers A1.3). The truck on the page uses the same rates | ✓ |
| All three | "Displayed load rates exclude applicable taxes." (Manisha's follow-up, 18 Nov) | ✓ |

No page among the three shows a dollar figure that isn't on the card.

## Still with Nav (not blocking)

- **A1.2:** whether the Bed Load schedule should be linked to the bed bug furniture removal page. Until then, those pages ask the customer to call for a quote.
- **A1.7:** any specific surcharges or tax treatment beyond "Applicable taxes and any job-specific charges will be identified in the final quote".
