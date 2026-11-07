# S K Stones India — Search, Filter & Save: UX Proposal

2026-11-08 · Source: https://claude.ai/artifact/Fi7sR7ATHYVb9UjVPYoAyx

## Summary

Recommendation: bring back search, filters and the shortlist as small client-side add-ons to the ported design. They read a build-time product index (about 7 KB gzipped for 444 stones), so every page stays static HTML. Delivery is three phases: shortlist and quote link first, then search, then filters.

The main constraint is data. Colour can only be guessed from product names (55% of stones). Finish is known for just 8%, and thickness, size and availability are missing entirely. Filters stay thin until the business supplies these fields (see Data gaps).

Two assumptions in the brief need correcting before work starts:

- **skstone.netlify.app never had search, filters or a shortlist.** They lived in our own pre-port build (last commit `aee7b6d`, branch `main`). They were removed on 2026-11-07, when the reference design replaced it and the decision was made to drop extras the reference lacks. This proposal reverses that decision for these three features.
- **The current quote form does not say "Shortlisted stones are added automatically".** That text belonged to the old two-step `QuoteForm` (`aee7b6d:components/forms/QuoteForm/QuoteForm.tsx`, line 301). The ported form (`components/ref/ContactFormModal.tsx`) has no stone field at all, so the shortlist-to-quote link has to be built, not just reconnected.

Scope: the brief's text stops after the Search item. Filters, the shortlist and delivery are covered here following the brief's Step 2 pattern (behaviour, components, data flow, edge cases).

## Audit 1: the current app

The ported site (branch `reference-port`, Next.js 16 static export) has no search, no filters, no saved state and no browser storage at all. Everything below is server-rendered, plus a few small client components.

**Routes (46 pages)**

| Route | Source | Notes |
| --- | --- | --- |
| `/` | `app/page.tsx` | 11 reference sections; phones hide five of them unless `?view=more` |
| `/[slug]` (34 product, hub and collection pages) | `app/[slug]/page.tsx` → `components/ref/ProductPageTemplate.tsx` | Hero, overview, product grid, fullscreen lightbox with magnifier |
| `/products` | `app/products/page.tsx` | 9 collection cards |
| `/landscaping`, `/flooring-executions`, `/stone-art-installations`, `/installations` | `components/ref/ServicePageTemplate.tsx` | Data in `content/ref/services.ts` |
| `/about`, `/projects`, `/contact`, `/thank-you`, 404 | `app/*/page.tsx` | Projects data in `content/ref/projects.ts` (7 clients, 28 photos) |

**Key components** (all in `components/ref/`): `RefShell` (page frame), `Header` (desktop mega-menu, no search icon), `MobileBottomNav` (Home, About, Products, Services, Projects, More), `Lightbox`, `ContactFormModal`, `FAQAccordion`, `RefImg`, `Fa` (icons). Each page's styles are generated from the reference CSS into `styles/ref/<page>.css` and scoped to a wrapper class.

**Stone data.** `content/generated/catalog.json` (built by `scripts/build-catalog.mjs`) holds 444 products and 35 categories; `lib/ref-catalog.ts` reads it. Fields per stone:

| Field | Filled | Where it comes from |
| --- | --- | --- |
| `id`, `name`, `collection`, `category`, `subcategory`, `image` | 100% | Reference product pages + verified corrections |
| `applications` | 100% | Copied from the category, so every stone in a category has the same list |
| `colours` | 55% | Guessed from words in the name (e.g. "Black", "Crema") |
| `origin` | 28% | Category level: India or Imported |
| `tags` | 14% | Name words (Onyx, Travertine, Statuario…) |
| `finish` | 8% | Name words (Polished, Leather…) |
| `size` | 0% | Never present in names |

**State.** No global store. Client state is local to components (open sheet, lightbox index, FAQ item). `components/ref/useClient.ts` reads browser-only values. The URL carries only `?view=more` (home) and `?submitted=1` (contact).

**localStorage.** None. The pre-port magnifier hint and shortlist keys (`sk-magnifier-used`, `sk-shortlist-v1`) are gone.

**Quote flow.** On `/contact`, "Open Form" on the Bangalore or Hyderabad card opens `ContactFormModal`. It posts natively to FormSubmit with name, phone, email and stone type (all required, browser-validated), plus location, quantity, colour, thickness, size, units and budget. FormSubmit emails info@skstonesindia.com and redirects to `/thank-you`. The form takes no stone names, reads no URL parameters except `submitted`, and no other page links into it with context. Product pages only link to `/contact` from the hero's "Get In Touch".

## Audit 2: the previous implementation

All three features shipped together in the pre-port build and are recoverable from git at commit `aee7b6d`. Their logic is sound and can be reused nearly as is; their UI was built for the old design and cannot.

|  | Search | Filters | Shortlist |
| --- | --- | --- | --- |
| Files | `components/catalog/ProductSearch/SearchDialog.tsx`, `catalog-index.ts`, `search-store.ts`; `app/search/page.tsx`; `app/data/catalog.json/route.ts` | `lib/search.ts`, `components/catalog/CatalogFilters/`, `components/catalog/ProductGrid/` | `components/shortlist/shortlist-store.ts`, `ShortlistDrawer.tsx`; hooks in `ProductCard`, `ProductLightbox`, header, bottom bar, `QuoteForm` |
| Data flow | Header button opened a `<dialog>`; on first open it fetched `/data/catalog.json` (a build-time static file of every product), then matched in memory | Category pages got their products from the server; filtering, counts and sorting ran in the browser | `useSyncExternalStore` over a module cache backed by localStorage; a separate open/closed signal for the drawer |
| UI | Modal: input, top 8 results with thumbnails, "press Enter for all"; full results page `/search` with the filter grid | Desktop sidebar, mobile "Filters" drawer; facets Category, Collection, Colour, Finish, Application, Origin with live counts; sort A–Z/Z–A; "Clear filters"; empty state | Bookmark toggle on cards and in the lightbox; counter badge in header and bottom bar; drawer listing saved stones with remove, clear, "Enquire about these", "Send list on WhatsApp" |
| Persistence | None needed | None (lived in the URL) | localStorage `sk-shortlist-v1` (id, name, collection, thumbnail), max 30, synced across tabs; in-memory fallback in private mode |
| URL | `/search?q=` | `?q=&colour=&finish=&sort=` (comma lists), updated with `history.replaceState`; `#product=<id>` opened the lightbox | `/contact?from=shortlist#quote` prefilled the form |
| Matching | Every typed word must start a word in the stone's text (name, collection, colours, finish, applications, origin, tags); accents stripped, gray→grey | Facet counts computed against all other active filters, so options never dead-end | n/a |

**What worked well**

- One build-time index served search everywhere; nothing ran on a server.
- Filters lived in the URL, so a filtered view could be shared or reloaded.
- Live facet counts stopped people picking a combination with no results.
- The shortlist survived reloads and tabs, failed safely in private mode, and fed both the quote form and WhatsApp.
- `lib/search.ts` had unit tests (`tests/unit/search.test.ts`, also removed).

**What was weak**

- No typo tolerance: "travertne" or "calacata" found nothing.
- Only stones were searched, not categories, services or projects.
- Facets were built on guessed attributes, so a "Black" filter missed black stones without "black" in their name.
- The shortlist stored names and thumbnails, so renamed products went stale.
- Nothing measured usage.

## Audit 3: data gaps

Good filters need attributes recorded per stone by the business, not guessed from names. Today only collection and category are reliable. Each gap below is a question only the business can answer; no value will be invented.

| Attribute | Today | Question for the business | Unlocks |
| --- | --- | --- | --- |
| Colour family | Guessed for 55% from names; e.g. none of the 17 cobbles or most tiles have one | Can someone tag each stone with 1–2 colour families from a fixed list (White, Beige, Grey, Black, Brown, Gold, Green, Blue, Red, Multi)? | Colour filter, "black granite" style searches |
| Finish | 8% (from names) | Which finishes is each stone offered in (polished, honed, leather, flamed, unpolished…)? One stone may have several | Finish filter |
| Application | 100%, but per category | Which uses suit each individual stone (e.g. which granites are recommended outdoors)? | Trustworthy application filter |
| Origin | 28%, India or Imported only | Country or region of origin per stone, where known? | Origin filter, search by origin |
| Thickness | None | Available thicknesses per stone (mm)? | Thickness filter; prefill the quote form |
| Slab or tile size | None | Formats per stone (slab, tile sizes)? | Size filter |
| Availability | None | Should the site show availability at all? If yes, who updates it and how often? | "In stock" filter or badge |
| Price band | None | Is any price indication allowed on the site? | Budget filter (only if approved) |
| Synonyms | None | Common customer names for stones (e.g. trade names, local names)? | Search finds what people actually type |
| Projects ↔ stones | None | Which stones were used in each of the 7 projects on `/projects`? | "Used in" links from search and stones |

Recommended data home: a new hand-edited `content/stone-attributes.json` (or a spreadsheet exported to it), keyed by stone id and merged in `scripts/build-catalog.mjs`, like `content/catalog-corrections.json` today. Until a field reaches about 80% coverage, its filter stays hidden.

## Search

One search, opened from a header icon, finds stones, collections, services, applications and projects as you type, and forgives small typos. It runs entirely in the browser over a small index built with the site.

**Behaviour**

1. **Entry points.** Desktop: a search icon between the nav and "Call Us Now" in `components/ref/Header.tsx`, plus the `/` key. Phone: an icon left of the "Contact Us" pill, plus a search field at the top of the bottom bar's Products sheet. The bottom bar keeps its six tabs; a seventh would crowd 375px screens.
2. **Layout.** Desktop: a centred glass panel (reference card style) over the dimmed page. Phone: full screen, input pinned at the top, the keyboard opening straight away.
3. **Before typing:** popular collections (from `content/nav.ts`) and up to 5 recent searches (localStorage `sk-recent-searches`, with a "Clear" link).
4. **From 2 characters:** suggestions grouped by type, best first:
   1. Stones (up to 6): thumbnail, name, collection.
   2. Collections (up to 3).
   3. Services and applications (up to 3), e.g. "Flooring".
   4. Projects (up to 2).
5. **Choosing a result:**
   - A stone opens its collection page with that stone's lightbox open (`/granites#stone=<id>`).
   - A collection opens its page; an application opens the results page filtered by it.
   - A project opens `/projects#project-<id>`.
6. **Enter** with no suggestion selected opens `/search?q=…`. This is a full results page (noindex) using the same grid, lightbox and filters as product pages.

**Matching.** Words are normalised (case, accents, gray→grey, colour/color) and each must match a word in the stone's text:

- An exact or prefix match scores highest.
- Otherwise up to 1 typo is allowed for words of 4–7 letters, and 2 for 8 or more ("travertne", "calacata" both match).
- Fields are weighted: name ×3, collection ×2, everything else ×1.
- Known spelling variants are built in (the reference's "Quatrz" and "Quartz" both work). Other synonyms come only from the business (Data gaps).

Recommendation: extend the old matcher in `lib/search.ts` with an edit-distance check (about 60 lines) rather than adding Fuse.js. With about 520 entries, speed is not a concern, and the project avoids unneeded dependencies. Fuse.js (about 6 KB gzipped) remains a fallback if ranking needs more tuning.

**Components and data flow**

- `app/data/search-index.json/route.ts` (restored, static): writes one JSON file at build time containing:
  - 444 stones (id, name, collection, colours, finish, applications, synonyms)
  - 34 collections
  - 4 services and 10 applications
  - 7 projects Estimated at about 10 KB gzipped.
- `components/ref/search/search-index.ts`: fetches it once per visit (through `withBase`, so it works under `/sk_stones`). The fetch starts when someone hovers or focuses the icon.
- `lib/search.ts`: normalising, matching, ranking and grouping, all pure functions with unit tests.
- `components/ref/search/SearchOverlay.tsx`: a native `<dialog>` with an ARIA combobox and listbox; arrow keys move, Enter opens, Escape closes. It is portalled into the page wrapper, so the scoped styles apply.
- `app/search/page.tsx`: the results page. This means removing today's `/search → /products` redirect from `content/categories.json`.
- `components/ref/Lightbox.tsx`: needs a new `#stone=<id>` deep link, so search results can open a stone directly.

**Edge cases**

- **No results:** suggest the closest collection, and offer "Ask us about '\<query>'" (WhatsApp and quote form, both prefilled with the query).
- **Index fails to load** (offline, blocked): say so, and keep Enter working to `/search`, which retries and otherwise links to `/products`.
- **Phone back button** closes the overlay instead of leaving the page (one `history` entry while open).
- **Long or odd input** (emoji, symbols, 200+ characters) is trimmed and normalised, and never crashes the matcher.
- **Renamed stones:** old ids in shared links fall back to the collection page without opening a lightbox.

## Filters

Filters sit above each product grid and on `/search`, narrow the grid instantly, and live in the URL. Only filters whose data is complete enough are shown, so customers never see a filter that hides stones it should include.

**Behaviour**

1. **Placement.** A filter bar sits between the grid heading ("Our Granites Collection · 48 Varieties") and the grid in `ProductPageTemplate`. The reference has no filter UI, so a horizontal bar of chips is the lightest fit for its centred, card-based layout. A sidebar would mean redesigning the page.
2. **Desktop.** Search-within field, then one dropdown chip per facet, a sort menu, and "Clear all" when anything is active. Active choices show as removable pills under the bar.
3. **Phone.** A single "Filters (2)" button opens a bottom sheet in the same style as the existing Products, Services and More sheets in `MobileBottomNav.tsx`. Each facet is a group of checkboxes with counts, and the sheet has a sticky "Show 12 stones" button.
4. **Facets, phased by data:**

| Facet | Show when | Why |
| --- | --- | --- |
| Search within this page | Now | Uses names; no data needed |
| Collection (on hub pages such as Tiles or Natural Stones, and `/search`) | Now | Reliable today |
| Colour family | After the business tags colours | Name guesses cover 55% and miss many dark stones |
| Finish | After the business supplies finishes | 8% today |
| Application | After per-stone uses are supplied | Per-category today, so it filters nothing within a page |
| Origin, Thickness, Size, Availability | Only if the business supplies them | Not recorded today |

5. **Counts.** Every option shows how many stones it leaves, computed against the other active filters (the old `facetCounts` logic). Options that would leave zero are disabled, not hidden, so the layout stays still.
6. **Sort.** Reference order (default, as the business arranged it), Name A–Z, Name Z–A.
7. **Result line.** The count label updates ("12 of 48 varieties"). The empty state offers "Clear filters" and "Ask us for this stone".

**Components and data flow**

- `lib/search.ts`: restored `applyFilters`, `facetCounts`, `sortProducts`, `stateFromParams` and `paramsFromState`, with facets driven by the coverage rule above.
- `components/ref/filters/FilterBar.tsx` (client): reads and writes the URL (`?q=&colour=&finish=&sort=`) with `history.replaceState`, so the back button is not flooded. It reuses `components/ui/useLocation.ts` from `aee7b6d`.
- The server still renders every product into the HTML (good for SEO and for no-JavaScript users). The client hides non-matching cards instead of re-rendering the grid, so images already loaded stay put.
- The lightbox steps only through visible (filtered) stones, and its "1 / N" counter follows suit.

**Edge cases**

- **A shared link with unknown values** (old or misspelt) ignores them and says "Some filters no longer apply".
- **Filters plus a lightbox deep link to a hidden stone:** the filters are cleared, so the requested stone shows.
- **No JavaScript:** all stones show, unfiltered.
- **Pages with 4–6 stones** (Feature Walls, MOP Work, Roof Flooring Tiles): the bar hides below 8 stones, where filtering adds nothing.

## Save (shortlist) and the quote flow

Visitors save stones while browsing, then send the whole list in one step: as a quote request, a WhatsApp message, or a showroom-visit request. The list is kept in the browser, needs no account, and the quote form fills itself from it.

[Diagram in the shared proposal: saved-list flow · 3 ways in, 4 ways out]

Stones can be saved from three places, and the list leaves through four actions, each landing with the team as an enquiry or a link.

**Saving**

- A "Save" toggle (bookmark icon, `aria-pressed`) sits on every product card's image corner and in the lightbox caption, so people can save while comparing full-size photos.
- Saving shows a short toast, "Saved · View list" (`aria-live`); tapping the icon again removes the stone.
- **Desktop:** a bookmark icon with a count sits next to the new search icon.
- **Phone:** the header has no room for two more icons beside "Contact Us". Instead the More tab shows a count badge, and "Saved stones (3)" becomes the first item of the More sheet.

**The saved list** (desktop side panel, phone bottom sheet, same style as the existing sheets)

- Each saved stone shows a thumbnail, name, collection and Remove.
- **Get a quote for these:** opens `/contact?saved=1`, which opens the form with the stones filled in.
- **Send on WhatsApp:** a prefilled message listing the stones with their page links (via `whatsappHref` in `lib/site.ts`).
- **Plan a showroom visit:** the same form with a note "I'd like to see these at the showroom" and the Bangalore or Hyderabad choice. The site has no booking system, so the team confirms the visit by phone.
- **Share list:** a link `/saved?ids=…` that an architect can send to a client. It opens a read-only page of those stones with "Save all" (noindex).
- **Clear list**, with an Undo toast.

**Quote form changes** (`components/ref/ContactFormModal.tsx`)

- New "Stones" field near the top, prefilled from the list as removable chips. It posts as a readable line ("Absolute Black (Indian Granites); Crema Marfil (Imported Marbles)") plus a hidden `products` field of ids, so FormSubmit's email names every stone.
- The helper text "Shortlisted stones are added automatically" returns, and is now true.
- The form opens itself when the page loads with `?saved=1`, or with `?stone=<id>` from a new "Enquire about this stone" link in the lightbox.
- "Stone type" stays required, but is preselected from the saved stones' categories when they all share one.

**Components and data flow**

- **Store** (`components/ref/shortlist/shortlist-store.ts`): the old store from `aee7b6d`, with one change. It saves ids only (`sk-shortlist-v2`: id and time saved); names, thumbnails and links come from the search index. A renamed stone never shows a stale name, and old `v1` lists are converted by id. It still uses `useSyncExternalStore`, keeps tabs in sync, caps the list at 30, and falls back to memory in private browsing.
- **Badges** reserve their space before the page finishes loading, so nothing shifts when the count appears.

**Edge cases**

- A saved stone later removed from the catalogue disappears from the list with a one-line notice.
- At 30 stones, Save explains the limit instead of failing silently.
- Storage is blocked: the list works for the visit and says it won't be kept.
- After a quote is sent, `/thank-you` offers "Clear saved list" rather than clearing it automatically. Architects often reuse a list for several clients (open question).

## Cross-cutting requirements

The three features must look native to the ported design and must not slow down or change the existing pages.

- **Design fit.** The reference CSS has no styles for any of these features, and `styles/ref/*.css` is generated, so new styles go in a hand-written `styles/ref/features.css`. It reuses the reference's own look: gold `#C9A227` accents, frosted cream glass cards with a thin gold border, Playfair Display headings, Poppins text, and the same sheet and pill shapes as `MobileBottomNav`. Styles are scoped to the page wrapper, like the generated sheets.
- **Mobile first.** Every control is at least 44 px tall. Sheets and the search overlay go full height on phones, respect the bottom safe area and the fixed bottom bar, and keep the keyboard from covering the input. None of this adds horizontal scroll at 360–430 px (covered by the existing `tests/e2e/responsive.spec.ts`).
- **Accessibility.**
  - Search is a labelled combobox and listbox.
  - Filters use real checkboxes in fieldsets; Save buttons are toggle buttons with `aria-pressed`.
  - Dialogs trap focus and return it to whatever opened them; result counts are announced.
  - Everything works by keyboard, and reduced-motion users get no slide animations.
- **Performance.** No change to first load:
  - The search index loads only when search, filters or the saved list are first used.
  - Filtering hides existing cards instead of re-rendering the grid.
  - The new client code is about 15 KB gzipped, split per feature with `next/dynamic`, as the pre-port overlays were.
- **SEO.** Product pages keep every stone in their HTML. `/search` and `/saved` are `noindex` and stay out of the sitemap. Filtered URLs point their canonical at the unfiltered page, so search engines see no duplicate pages.
- **Static hosting.** No server is needed; everything works on GitHub Pages under `/sk_stones` through `withBase` (`lib/base-path.ts`).
- **Measuring.** The site has no analytics today. If the business wants evidence that these features raise enquiries, it needs a privacy-friendly tool (open question). Events worth counting: search used, no-result queries, filter used, stone saved, list sent (quote, WhatsApp, visit).

## Delivery plan

Three phases, about 12 working days of development in total, ordered by what drives enquiries soonest. Filters beyond "search within" and "collection" wait for the business's stone attributes. The day counts are engineering estimates, not commitments.

[Diagram in the shared proposal: delivery roadmap · 3 phases, 1 data gate (bands not to scale)]

Each phase ships on its own; facets beyond the first set unlock one at a time as the business's attribute data reaches coverage.

**Done when (acceptance criteria)**

- [ ] **Phase 1 · Save and quote (about 4 days).**

  A stone saved on a product page or in the lightbox shows in the list on another page and after a reload. "Get a quote for these" opens the form with every saved stone listed, and the FormSubmit email shows them. The WhatsApp message lists the stones with links. The More-tab badge and header count are correct at 375 px and 1280 px.
- [ ] **Phase 2 · Search (about 5 days).**

  "travertne", "calacata", "black granite" and "quartz" each return sensible results in under 50 ms after the index loads. A stone result opens its lightbox directly. `/search` works and is noindex. Keyboard-only and screen-reader runs pass. First-load size of product pages is unchanged.
- [ ] **Phase 3 · Filters (about 3 days, then per new data field).**

  Filtered URLs survive reload and sharing. Counts never offer a dead end. The lightbox steps only through visible stones. Each new facet ships only once its attribute covers about 80% of stones.

**Risks**

- **Data never arrives:** filters stay limited to search-within and collection. The feature still works; it is just less useful.
- **Design drift:** new UI that doesn't match the reference. Mitigation: side-by-side screenshot checks against the reference style, as done for the port.
- **Quote email clutter:** long stone lists in FormSubmit's email. Mitigation: one readable "Stones" line plus a separate ids field.

## Open questions and decisions

Decisions needed before Phase 1:

- [ ] Approve re-adding search, filters and the shortlist on top of the reference design. This reverses the 2026-11-07 decision to drop extras the reference lacks.
- [ ] On phones, is the More-tab badge plus a More-sheet entry acceptable for the saved list? The alternative is a seventh bottom-bar tab or a header icon, which would crowd 375 px screens.
- [ ] Should a sent quote clear the saved list automatically, or offer to?
- [ ] Is a shareable `/saved?ids=…` link wanted, e.g. architects sending a selection to a client?
- [ ] Add a small edit-distance matcher in-house (recommended) or use Fuse.js?

Business data (details in Data gaps):

- [ ] Colour families per stone, and who maintains them.
- [ ] Finishes, thicknesses and formats offered per stone.
- [ ] Recommended applications per stone, not per category.
- [ ] Origin per stone, where known.
- [ ] Whether availability or any price indication may appear on the site.
- [ ] Customer synonyms and trade names to search on.
- [ ] Which stones were used in each `/projects` client project.
- [ ] Is a privacy-friendly analytics tool acceptable for measuring searches, saves and sent lists?
