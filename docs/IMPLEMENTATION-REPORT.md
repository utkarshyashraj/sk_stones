# Implementation report: search, filters, saved list and UX improvements

Branch `feature/search-filter-save`. It implements everything in `docs/PROPOSAL.md`, as amended by the implementation brief. The branch has not been merged or pushed. Pushing to `main` deploys the live site, so that needs explicit approval.

Each milestone passed lint, typecheck, unit and e2e tests before it was committed. Final state:

- **Unit tests:** 58 passed (Vitest).
- **e2e:** 90 passed and 14 skipped by design (Playwright on Edge; the skips are desktop-only or phone-only cases).
- **Build checks:** `verify-build` OK, Prettier clean.

## 1. What was built, per milestone

| #   | Milestone                    | Commits                                           |
| --- | ---------------------------- | ------------------------------------------------- |
| 1   | Data layer                   | `055d447`                                         |
| 2   | Saved list (shortlist)       | `f4579b6`, `0091130`                              |
| 3   | Search                       | `b501cfe`                                         |
| 4   | Filters                      | `3ee19bf` (+ `f5cefdd`, `00d134c` tooling/format) |
| 5   | Lightbox detail panel        | `6d21749`                                         |
| 6   | Conversion helpers           | `ffde7e0`                                         |
| 7   | "Help me choose"             | `fdcbb87`                                         |
| 8   | Content and SEO              | `d42f302`                                         |
| 9   | QA, screenshots, this report | the commit that adds this file                    |

**M1, data layer.**

- `content/stone-attributes.json` holds the business-confirmed attributes. They are validated and merged at build time by `scripts/build-catalog.mjs`.
- The catalogue records per-field coverage, and anything gated unlocks at 80%.
- Two tools for the owner: a CSV template (`npm run attributes:template` produces `docs/stone-attributes-template.csv`; suggested values are marked "(guess)") and an importer (`npm run attributes:import <csv> [--dry-run]`).
- The static search index is `/data/search-index.json`, about 10 KB gzipped.
- Guesses are used only to help search match. They are never shown as facts and never count toward coverage.

**M2, saved list.**

- Every stone card and the viewer have a Save toggle (`aria-pressed`).
- The list lives in localStorage `sk-shortlist-v2`, holds at most 30 stones and converts lists saved by the old site.
- Phones get a floating "Saved (N)" pill. It hides while a sheet, the viewer or search is open. The More tab shows a badge, and "Saved stones (N)" is the first entry in the More sheet.
- Desktop gets search and bookmark icons in the header.
- The saved panel offers:
  - quote form, prefilled
  - WhatsApp message listing every stone
  - showroom visit
  - share link to `/saved?ids=` (that page has "Save all")
  - clear, with undo
- /thank-you offers "Clear saved list".
- The feature bundle loads lazily, so product pages stay under the first-load baseline.

**M3, search.**

- The matcher is written in-house and tolerates typos. It understands accents, synonyms (gray/grey, colour/color, quatrz/quartz) and partial words, and gives the stone name more weight.
- Search opens as an overlay (an accessible combobox/listbox) from the header icon, the phone sheet and the "/" key.
- The overlay groups results into stones, collections, services and uses, and projects.
- Recent searches are remembered.
- The no-results state offers the closest collection, WhatsApp and "Ask in a quote".
- /search is a full results page with filters. It is noindex and kept out of the sitemap.

**M4, filters.**

- A facet appears only when two conditions hold:
  - business coverage for its field is at least 80% (Collection needs none)
  - the page shows at least two different values
- Grids with fewer than 8 stones get no filter bar.
- Desktop uses popovers; phones use a bottom sheet with fieldsets of real checkboxes.
- Counts are live, and options that would leave nothing are disabled.
- Also included:
  - search-within box
  - sort
  - removable filter pills
  - "Clear all"
  - an empty state
- Filters are kept in the URL (replaceState). They survive reload and Back, and unknown values are dropped with a notice.
- Product pages still contain every stone in their HTML. Filtered URLs keep the unfiltered page as canonical.

**M5, lightbox detail panel.**

- The panel shows name, collection and position, then only the facts that exist for that stone. Each empty row is left out.
- Save, "Enquire about this stone" and "Request a sample".
- Up to six related stones from the same collection appear as thumbnails that switch the viewer.
- On desktop it is a right-hand column. On phones it is a bottom panel that folds behind "Details", so the photo stays large.
- The magnifier still works.

**M6, conversion helpers.**

- **Area calculator** (`lib/area-calc.ts`, pure functions with unit tests):
  - several areas, length × width in ft or m
  - wastage %, default 10, limited to 0–50
  - output in sq ft (rounded up) and sq m
  - launched from the quote form ("Not sure? Calculate"), product pages and the saved list
  - "Use this in my quote" fills Quantity
- **Recently viewed:** the last 12 stones opened in the viewer (`sk-recent-v1`, ids only), shown as a strip on /products and product pages, with Clear.
- **Request samples:** in the saved list and the viewer. It opens the quote form with the stones prefilled and the "Sample request" label.
- **Mobile quick actions:** see the decision under Deviations.

**M7, "Help me choose".**

- A dialog on desktop and full screen on phones, opened from /products and from the search overlay before typing.
- Step 1 asks where the stone goes and maps the answer to application values.
- The colour and Indian/imported steps appear only at 80% business coverage, so today the guide is one step.
- If nothing matches, the last step is dropped and the results page says so.
- Results open on /search with:
  - "Stones for <place>" heading
  - "Save all"
  - "Get a quote for these"
  - "Start again"
- Tracks `guide_completed`.

**M8, content and SEO.**

- **JSON-LD:**
  - LocalBusiness on home and contact only
  - FAQPage wherever the FAQ accordion appears (home, contact, the four service pages)
  - BreadcrumbList on every product page
  - a unit test checks the shapes, and `verify-build` checks the placement
- **Project↔stone links:** "Used in" in the viewer and "Stones used" on each project, both driven by data and hidden until it exists.
- **Care guides:** `content/care-guides.ts` covers marble, granite and natural stone with general practice. They stay hidden unless `NEXT_PUBLIC_SHOW_CARE_GUIDES=1` is set, and carry a TODO for business review.
- Also fixed: the JSON-LD serialiser was not escaping `<`.

**Analytics.** `lib/analytics.ts` `track()` does nothing unless `NEXT_PUBLIC_ANALYTICS` is set. Events:

- `search_used`
- `search_no_results` (with the query)
- `filter_used`
- `stone_saved` / `stone_unsaved`
- `list_sent` (quote | whatsapp | visit | share | samples)
- `calculator_used`
- `guide_completed`

## 2. Deviations from the brief

- **React.lazy instead of next/dynamic for the feature bundle.** next/dynamic pulled about 0.8 KB extra into every product page's first-load JS. That would have broken "no increase in product pages' first-load JS". React.lazy plus a small boot component (load when idle at most 2.5 s after load, or on the first pointer, key or focus) does the same job. Clicks made before it loads are queued and replayed.
- **Desktop search and bookmark icons sit inside the main nav,** not as a separate cluster. That keeps the reference header layout intact.
- **"Staircase" is not offered in the guide yet.** The catalogue has no application value that stands for staircases, and mapping it to "Flooring" would be a product claim. The option appears automatically once one exists (see section 3).
- **"Use this in my quote" fills Quantity with the full text,** for example "176 sq ft (16.4 sq m) incl. 10% wastage". The form's only unit select belongs to Size, so it is switched to SQ FT only when Size is empty.
- **"Get a quote for these" (guide results) lists the stones** through a new `?stones=` form parameter. That avoids silently changing the visitor's saved list. Above 30 stones it opens the form with "Stones for <place>" instead, and "Save all" is disabled with an explanation, because the saved list holds 30.
- **The `list_sent` event has an extra `samples` channel** for the new sample request.
- **Mobile quick actions (decision).** Phones already had a "Contact Us" pill in the header, and Call and WhatsApp existed only as small icons at the bottom of the More sheet. I added a one-tap **Call / WhatsApp / Quote** row near the top of the More sheet, directly under "Saved stones". There is no new floating bar, so nothing competes with the bottom nav or the Saved pill.
- **Care guides are switched on through `pageExtensions`.** A static export cannot build a dynamic route that produces no pages. The route file is therefore `app/care/[material]/page.guide.tsx`, and Next only treats it as a page when the flag is set.
- **The e2e suite waits for hydration or the lazy bundle where a test acts faster than any visitor could** (`tests/e2e/ready.ts`). Examples: pressing "/" in the first milliseconds, or Playwright keeping a handle to the static filter bar that the live one replaces. Without this the suite failed intermittently under load. Early real interactions are still covered by their own tests.

## 3. Hidden until data, and what unlocks each feature

Business data goes in `docs/stone-attributes-template.csv`, one row per stone, and is imported with `npm run attributes:import`. A feature that needs coverage appears automatically once 80% of stones have a business-confirmed value. Cells marked "(guess)" don't count.

| Feature                                                                                              | CSV column         | Unlocks when                                                                                                                           |
| ---------------------------------------------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Colour filter; colour row in the viewer; guide step 2 "look"                                         | `colour_families`  | Facet and guide step at 80% coverage; the viewer row shows for any stone that has a value                                              |
| Finish filter; finish row in the viewer                                                              | `finishes`         | Same                                                                                                                                   |
| "Where to use" filter                                                                                | `applications`     | Facet at 80% business coverage. The guide's step 1 and the viewer's "Suitable for" row already use the curated collection-level values |
| Origin filter; guide step 3 "Indian or imported"                                                     | `origin`           | 80% coverage (the viewer already shows collection-level origin where the reference copy states it)                                     |
| Thickness filter; thickness row                                                                      | `thicknesses_mm`   | Facet at 80%; row per stone                                                                                                            |
| Size filter; size row                                                                                | `formats`          | Facet at 80%; row per stone                                                                                                            |
| Extra search terms                                                                                   | `synonyms`         | Immediately, per stone                                                                                                                 |
| "Used in" (viewer) and "Stones used" (projects page)                                                 | `used_in_projects` | Immediately, per stone (project names must match /projects)                                                                            |
| "Staircase" option in "Help me choose"                                                               | `applications`     | Add "Staircases" to `applicationVocabulary` in `content/categories.json` (web team), then tag stones with it                           |
| Care guides (/care/marble, /care/granite, /care/natural-stone) and their links from collection pages | none               | Business approves `content/care-guides.ts`, then build with `NEXT_PUBLIC_SHOW_CARE_GUIDES=1`                                           |
| Analytics events                                                                                     | none               | Set `NEXT_PUBLIC_ANALYTICS` and wire `lib/analytics.ts` to the chosen tool                                                             |

Nothing in this work invents stock, prices, origins, finishes, thicknesses or project↔stone links.

## 4. QA results

**First-load JS** (gzip of every script in the exported HTML) against the pre-M2 baseline:

| Page                   | Before (055d447) | After    | Change                                        |
| ---------------------- | ---------------- | -------- | --------------------------------------------- |
| /granites (product)    | 182.2 KB         | 181.9 KB | −0.3 KB                                       |
| /kota-stones (product) | 182.2 KB         | 181.9 KB | −0.3 KB                                       |
| / (home)               | 183.9 KB         | 183.5 KB | −0.4 KB                                       |
| /contact               | 192.2 KB         | 187.1 KB | −5.1 KB                                       |
| /products (hub)        | 180.7 KB         | 181.9 KB | +1.2 KB (now shares the product pages' chunk) |

**Lighthouse, mobile preset** (performance, accessibility, best practices, SEO). Both builds were measured back to back on the same machine. Desktop scores were 93–100 for performance on both builds.

| Page      | Before (055d447)    | After               |
| --------- | ------------------- | ------------------- |
| /         | 65 / 94 / 96 / 100  | 71 / 94 / 96 / 100  |
| /granites | 73 / 98 / 100 / 100 | 71 / 98 / 100 / 100 |
| /contact  | 95 / 94 / 100 / 100 | 95 / 94 / 100 / 100 |

These match within run-to-run noise. The low mobile performance on / and /granites comes from LCP on the reference design's hero images (about 8–10 s on simulated 4G). It predates this work.

**Under the GitHub Pages base path.** A build with `NEXT_PUBLIC_BASE_PATH=/sk_stones` and trailing slashes was served by a Pages emulator and checked at 375 and 1280:

- all 43 sitemap pages load
- the search index loads, and search suggests
- the viewer deep link opens with the detail panel and related thumbnails
- saved list → prefilled quote form
- calculator → Quantity
- `/saved?ids=`
- guide → filtered /search
- a filtered URL applies, and its canonical is the unfiltered page
- recently viewed strip
- no console errors and no 4xx/5xx responses

**Screenshots** are in `docs/screenshots/`, each at 375 and 1280 (`*-375.jpg`, `*-1280.jpg`):

- `saved-list`
- `quote-form-prefilled`
- `search-empty`, `search-results`, `search-none`
- `filters-bar`
- `filters-sheet` (phone) / `filters-popover` (desktop)
- `lightbox-detail`
- `calculator`
- `guide`, `guide-results`
- `shared-saved-page`

## 5. Known issues

- **Phone service pages have no visible `<h1>`.** The reference design hides the service hero block on phones, so the page's h1 is hidden too (reference port, `117ab53`). It is worth a small follow-up for SEO and accessibility.
- **Mobile LCP on the home and product pages is slow** (hero images). This predates the work; see the Lighthouse table.
- **/products first-load JS is 1.2 KB above its own baseline,** because it now loads the same chunk as the product pages. Product pages themselves are below baseline.
- **Toasts can still be on screen for a moment after a client-side navigation** (for example "Saved …" while the quote form opens). This is cosmetic.
- **A key press in the first moments, before hydration, is not handled** (for example "/" to search). Clicks on stone cards and Save buttons made before the feature bundle loads are queued and replayed.
- **The reference's lightbox background is 0.97 black,** so the page behind shows faintly. This is unchanged from the reference.

## 6. Next steps for the business

1. **Fill in the attributes sheet** (`docs/stone-attributes-template.csv`, guide in `docs/stone-attributes-README.md`). Colour families and finishes give the most value: they unlock the colour and finish filters, the guide's "look" step and fuller detail panels. Origin unlocks the Indian/imported step.
2. **Link stones to projects** (`used_in_projects`) for flagship clients on /projects such as JW Marriott and Infosys. It shows immediately as "Used in" and "Stones used".
3. **Review the care guides** in `content/care-guides.ts`. Edit or approve them, then switch on `NEXT_PUBLIC_SHOW_CARE_GUIDES=1` in the deploy workflow.
4. **Decide on analytics** (for example GA4 or Plausible). Set `NEXT_PUBLIC_ANALYTICS` and connect `track()`, so you can see what people search for and don't find (`search_no_results`).
5. **Confirm whether staircases should be a listed use.** If so, the web team adds the "Staircases" value and you tag the suitable stones.
6. **Review the branch on a preview,** then approve the merge to `main`. That push deploys the live site.
