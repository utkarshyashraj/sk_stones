# Stone details sheet: how to fill it in

The website can offer colour and finish filters, a "help me choose" guide and richer stone details, but only
once we know these facts for each stone. We never guess them on the live site. This sheet is where you tell us.

**File:** `stone-attributes-template.csv`. It opens in Excel or Google Sheets and has one row per stone (444 rows).

## What to do

1. Open the file in Excel or Google Sheets.
2. For each stone, fill in or correct the columns below. Leave a cell **empty** if you don't know.
3. Some cells are already filled with our **guess**, for example `Black (guess)`. These come from the stone's
   name or its category. To confirm one, **delete the words `(guess)`**. If it's wrong, replace it. If you don't
   know, leave it as it is: anything still marked `(guess)` is ignored.
4. When a cell has more than one value, separate them with a **semicolon**, for example `Polished; Leather`.
5. Save as **CSV** (File → Save As → CSV UTF-8, or in Google Sheets, File → Download → CSV) and send it back.

You don't need to finish everything at once. Each feature switches on by itself once about **80% of stones**
have that column filled.

## The columns

| Column                                 | What to write                                                          | Allowed values                                                                                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`, `name`, `collection`, `category` | Don't change these; they identify the stone                            | —                                                                                                                                                                          |
| `colour_families`                      | The stone's main colours, up to 3                                      | White, Beige, Grey, Black, Brown, Gold, Yellow, Green, Blue, Red, Pink, Multi                                                                                              |
| `finishes`                             | Every finish you can supply this stone in                              | Polished, Honed, Leather, Flamed, Brushed, Sandblasted, Tumbled, Natural, Unpolished, Matt, Glossy, Textured, Split face                                                   |
| `applications`                         | Where this stone is recommended                                        | Flooring, Wall Cladding, Countertops & Kitchens, Bathrooms, Paving & Pathways, Landscaping, Facades & Elevations, Roofing & Terraces, Decorative & Art, Walls & Partitions |
| `origin`                               | Country or region, e.g. `India`, `Rajasthan, India`, `Italy`, `Brazil` | Any text                                                                                                                                                                   |
| `thicknesses_mm`                       | Thicknesses you supply, in millimetres, e.g. `18; 20; 30`              | Numbers only                                                                                                                                                               |
| `formats`                              | Slab or tile sizes, e.g. `Slab; 600 x 600 mm tile`                     | Any text                                                                                                                                                                   |
| `synonyms`                             | Other names customers use for this stone (trade names, local names)    | Any text                                                                                                                                                                   |
| `used_in_projects`                     | Which of our projects used this stone                                  | JW Marriott, Infosys, Aster DM Healthcare, AIG Hospitals, Indian Railways, Airports Authority of India, CBSE                                                               |
| `notes`                                | Anything for our team (not shown on the website)                       | Any text                                                                                                                                                                   |

## What each column switches on

| Column                      | When about 80% of stones have it                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `colour_families`           | Colour filter on product pages and search; the "Look" step in "Help me choose"; colours in the stone details |
| `finishes`                  | Finish filter; finishes in the stone details                                                                 |
| `applications`              | "Where will you use it" filter on every page (today it uses the category's general list)                     |
| `origin`                    | Origin filter; the "Indian or imported" step in "Help me choose"                                             |
| `thicknesses_mm`, `formats` | Thickness and size filters; shown in the stone details as soon as a stone has them                           |
| `synonyms`                  | Search finds stones by these names straight away (no 80% needed)                                             |
| `used_in_projects`          | "Used in" on the stone, and "Stones used" on the project, straight away for each filled row                  |

## For the web team

```bash
node scripts/import-stone-attributes.mjs path/to/filled.csv --dry-run   # check: errors + coverage per column
node scripts/import-stone-attributes.mjs path/to/filled.csv             # write content/stone-attributes.json
npm run catalog:build && npm run build                                   # publish
node scripts/export-stone-attributes-template.mjs                        # refresh the sheet (keeps confirmed values)
```

The import stops without writing anything if a value is not in the allowed lists, and it names the row.
