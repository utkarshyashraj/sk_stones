# Black & Champagne redesign — implementation report

Date: 7 November 2026. Scope: UI/UX cleanup and the dark-marble visual identity, applied to the existing Next.js
site through its shared components and tokens. Routes, data, forms, SEO and analytics-free behaviour are unchanged.

## 1. What the audit found

| Area   | Finding                                                                                                                                                                                                                              |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Theme  | Light ivory content sections alternating with dark bands; tokens named by colour (`--c-white`, `--c-stone-*`) rather than role.                                                                                                      |
| Labels | ~25 uppercase eyebrow labels, most repeating the heading, the breadcrumb or the page name (e.g. "Kota & Limestones" eyebrow above the "Kota Stone…" h1, under a breadcrumb that already says it).                                    |
| Icons  | 24 decorative icons: checkmark bullets, five-star rows on every review (implying a rating that is not stated anywhere), a quote mark, and arrows inside buttons and links.                                                           |
| CTAs   | Every closing band had Quote + Call + WhatsApp, while phone and WhatsApp were already in the header and bottom nav. The home FAQ had a Contact button directly above the closing CTA. Service heroes and the drawer repeated "Call". |
| Footer | Four columns: blurb, social icons, the full product and service menus (already in the header), contact block with icons, and a duplicate "Request a quote" link.                                                                     |
| Cards  | Product cards carried 3–4 attribute chips and a "Quick view" pill; collection/service/case-study cards each had a generic "Explore / Learn more / Read case study →" line although the whole card is the link.                       |
| Gold   | Filled gold buttons on every product card and the header phone CTA pushed the accent well beyond an accent role.                                                                                                                     |

## 2. Changes

### Removed / simplified

- **Eyebrows**: removed from home (6), about (4), category pages (3), service template (5), projects, products, contact page heroes. Kept only where they inform: case-study sector, "Trusted by architects, builders & developers", "Error 404", the collection name in the product lightbox, the featured-review heading. Section headings now carry a 40 px champagne hairline instead.
- **Icons**: checkmark bullets → champagne-dash lists (`.dash-list`); star rows and quote icon removed; arrows removed from buttons/links; contact-card icons removed (labels already say "Phone", "Email"…); placeholder grid icon replaced by the marble texture. Remaining icons are functional only (search, menu, close, shortlist, phone, WhatsApp, expand, lightbox navigation) and share one stroke style and size scale.
- **Generic labels**: "Explore", "Learn more", "Read case study", "Quick view" text, attribute chips on product cards (specifications remain in the lightbox), homepage collection descriptions (still on the products hub), hero eyebrow "Crafting timeless spaces since 2014" (the stats already say 12+ years).

### CTA hierarchy

| Location                     | Before                                 | After                                                      |
| ---------------------------- | -------------------------------------- | ---------------------------------------------------------- |
| Header                       | Filled gold phone pill + WhatsApp icon | Outline phone button + WhatsApp icon (single quiet accent) |
| Closing CTA band (all pages) | Quote + Call + WhatsApp                | Primary action + WhatsApp (page-specific message)          |
| Home FAQ                     | Phone sentence + Contact button        | Removed (CTA band follows immediately)                     |
| Service heroes               | Get a quote + Call now                 | Get a quote                                                |
| Mobile drawer                | Call + WhatsApp                        | WhatsApp (Call lives in the bottom nav)                    |
| Thank-you page               | 4 buttons incl. Call                   | Home, Explore stones, WhatsApp                             |
| Product cards                | Filled gold Enquire                    | Outline Enquire (filled primary kept in the lightbox)      |
| Footer                       | "Request a quote" link                 | Removed                                                    |

Contextual actions were kept: product enquiry, shortlist, category "Get a quote", case-study quote with its own WhatsApp text.

### Footer

Four columns + bottom bar (≈ 520 px tall on desktop) → two thin rows (≈ 170 px): logo + Products / Projects /
About / Contact; then locality (Maps link) · phone · email · hours, and the copyright. No icons, no blurb, no
duplicate menus or CTAs. There are no privacy/terms pages on the site, so no legal links were invented — add them
if the business publishes those policies.

### Design system (`styles/tokens.css`)

Role-based tokens replace colour-named ones across all 30+ CSS modules:

| Token                     | Value             | Use                                                                                   |
| ------------------------- | ----------------- | ------------------------------------------------------------------------------------- |
| `--bg`                    | #10100F           | page background (≈ 85% of the surface)                                                |
| `--bg-raised`             | #191817           | alternating bands, cards                                                              |
| `--surface`               | #211F1C           | dialogs, form panels, hover                                                           |
| `--text`                  | #F5F1E9           | headings, body                                                                        |
| `--text-2`                | #AAA39A           | secondary text                                                                        |
| `--text-3`                | #948D83           | metadata — spec value #817B72 **lifted for WCAG AA** (it measured 4.22:1 on charcoal) |
| `--accent` / `--accent-2` | #C6A875 / #A98C5F | champagne: primary CTA, active nav, hairlines, focus                                  |
| `--line`                  | #39332B           | borders and separators                                                                |

Shape is quieter: 4–10 px radii (was pill buttons and 16 px cards), hairlines instead of shadows, no lift-on-hover,
no glow. Buttons: champagne primary, neutral outline secondary; WhatsApp is a neutral outline whose glyph alone
carries the brand green. Typography keeps Playfair Display (600, roman + italic accent) and Poppins (400/500/600),
already self-hosted; uppercase is limited to the few remaining labels.

### Marble

The texture is the company's own **Nero Portoro** slab photo (black marble with natural gold veining), processed by
`scripts/make-textures.mjs`: luminance is re-mapped so the stone body stays near #10100F with its natural grain,
and only the veins take a muted champagne. Output: 960 px and 1920 px, AVIF 21–49 KB / WebP 26–59 KB, preloaded.
Applied only to the homepage hero, page headers and the closing CTA band (utility class `.marble` with a
left-to-right legibility overlay). Every other section uses solid charcoal so product photography stays the focus.

### Components modified

Tokens/globals; Header (phone CTA, menu panels), MobileNavigation, Footer (rewritten), PageHero, CTA, Collections
(+ `dense` two-up mobile grid), Services, CaseStudies, Testimonials, Stats, Process, ProductCard, QuoteForm,
service and case-study templates; pages: home, about, contact, projects, products, category template, thank-you.

## 3. Verification

| Check                             | Result                                                                                                                                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript, ESLint, Prettier      | pass                                                                                                                                                                                           |
| Unit tests                        | 32 / 32                                                                                                                                                                                        |
| Build + build verifier            | pass — every link, image, title, canonical, JSON-LD and redirect still valid                                                                                                                   |
| Playwright e2e (desktop + mobile) | 50 passed, 8 skipped by design — navigation, mega menu, drawer, search, filters, lightbox, shortlist, quote form (incl. POST payload and no-JS), redirects, 7 viewport widths with no overflow |
| Lighthouse accessibility          | 100 on home, Kota, Tiles, Contact, Installations (mobile and desktop) after the `--text-3` fix                                                                                                 |
| Visual review                     | homepage, catalog, contact, service, about at 1440 px and 390 px                                                                                                                               |

Lighthouse medians: see section 4 of `docs/AUDIT-REPORT.md` (updated after this change).

## 4. Remaining notes

- Mobile performance remains below 90 on the heaviest pages (see the audit report); the marble is preloaded so it
  does not delay the page, but large card grids still dominate main-thread time.
- The spec's muted grey was adjusted for contrast; everything else in the palette is used as specified.
- Privacy policy / terms pages do not exist yet.
