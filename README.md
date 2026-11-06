# S K Stones India — website

Marketing site and stone catalogue for **S K Stones India** (formerly Shree Stones & Services), Bengaluru.
Built with **Next.js 16 (App Router) + React 19 + TypeScript**, exported as **static HTML** and hosted on **Netlify**.

- 51 pre-rendered pages (47 indexable), 460 products in 35 categories, no runtime server.
- Every page is plain HTML at build time (SEO-safe); React hydrates only the interactive parts.
- All media is self-hosted and pre-optimised (WebP/AVIF, responsive `srcset`).

## Quick start

```bash
nvm use            # Node 22 (see .nvmrc; Node ≥ 20.9 works)
npm ci
npm run dev        # http://localhost:3000 (development)
npm run build      # static export to out/ + Netlify _redirects/_headers
npm start          # preview out/ at http://localhost:4321 (pretty URLs, 301s, compression — like Netlify)
```

## Quality gates

| Command                 | What it checks                                                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`     | TypeScript strict mode (`noUncheckedIndexedAccess` on)                                                                                    |
| `npm run lint`          | ESLint (Next.js core-web-vitals + TypeScript rules, React hooks rules)                                                                    |
| `npm run format:check`  | Prettier                                                                                                                                  |
| `npm test`              | Vitest unit tests — search/filter logic, catalog integrity, label corrections, SEO metadata, sitemap, redirects                           |
| `npm run build`         | Production static export (fails on type errors)                                                                                           |
| `npm run verify:routes` | Crawls `out/`: sitemap ↔ pages, every internal link and image, unique titles/descriptions, canonical/OG, one `<h1>`, JSON-LD, redirects   |
| `npm run test:e2e`      | Playwright: every route, navigation/mega menu/mobile menu, search, filters, lightbox, shortlist, quote form, redirects, 7 viewport widths |
| `npm run lighthouse`    | Lighthouse mobile + desktop on key pages (needs `npm start` running and `CHROME_PATH`); `-- --runs=3` reports medians                     |
| `npm run check`         | All of the above except Lighthouse                                                                                                        |

CI (`.github/workflows/ci.yml`) runs the same gates on every push and pull request.

## Project structure

```
app/                     Routes (App Router). [slug]/ generates all 35 catalog pages from data.
  layout.tsx             Root layout: fonts, header, footer, global overlays, LocalBusiness JSON-LD
  page.tsx               Homepage (7 sections)
  products/ search/      Products hub; full-catalogue search (noindex)
  about/ contact/ projects/ thank-you/
  installations/ landscaping/ flooring-executions/ stone-art-installations/   (ServicePageView)
  case-study-*/          (CaseStudyView)
  data/catalog.json/     Static product index used by client-side search
  sitemap.ts robots.ts   Generated at build time
components/
  layout/                Header (desktop nav + mega menu), MobileNavigation (drawer + bottom nav), Footer, Breadcrumbs
  catalog/               ProductGrid (search/filters/sort), ProductCard, ProductLightbox, CatalogFilters, ProductSearch
  marketing/             PageHero, Collections, Services, Process, Stats, Testimonials, FAQ, CTA, Gallery, CaseStudies, VideoFeature
  forms/QuoteForm/       Two-step enquiry form
  shortlist/             Shortlist store (localStorage) + drawer
  templates/             Service and case-study page templates
  ui/                    Icon (inline SVG), Picture (responsive images), modal/URL hooks
content/
  categories.json        Curated taxonomy, SEO titles/descriptions, hero copy  ← edit
  catalog-corrections.json  Label fixes with evidence; items needing business verification  ← edit
  site-images.json       Non-catalog images used by pages  ← edit
  pages.ts               Page copy (home, about, services, case studies, FAQs, testimonials)  ← edit
  generated/             catalog.json, image-jobs.json, images.json (GENERATED — do not edit)
  raw/                   One-time extraction from the legacy site (provenance)
lib/                     catalog, search, seo, routes, nav, site (business details), image helpers
styles/                  tokens.css (design tokens), globals.css (base, buttons, utilities)
public/images/           Optimised images: catalog/, categories/, site/
public/media/            Homepage video (720p 7.8 MB, 540p 2.9 MB, poster)
scripts/                 Catalog pipeline, image optimiser, postbuild, verifier, preview server, Lighthouse
tests/unit, tests/e2e    Vitest and Playwright suites
legacy/                  The previous static site, kept for reference (not deployed)
docs/AUDIT-REPORT.md     Migration audit: issues, fixes, test evidence, open items
```

## Editing content

**Business details** (phone, address, hours, form destination): `lib/site.ts`.

**Page copy**: `content/pages.ts`.

**Products and categories** are generated. The pipeline is:

```bash
npm run catalog:extract     # legacy HTML -> content/raw/legacy-catalog.json   (one-time; already done)
npm run catalog:download    # legacy images -> .cache/legacy-src               (one-time; already done)
npm run catalog:build       # raw + categories.json + corrections -> content/generated/catalog.json
npm run images:optimize     # .cache sources -> public/images (incremental)
```

To rename or re-label a product, add a rule to `content/catalog-corrections.json` (matched by image filename,
never by position) and run `npm run catalog:build`. Category titles, descriptions, hero text and applications
live in `content/categories.json`.

> The original legacy image files are cached in `.cache/legacy-src/` (git-ignored, ~98 MB). The optimised
> 1200 px WebP in `public/images/catalog/` is the archival copy in the repository. Keep a backup of `.cache/` if
> you may need to re-optimise from the originals.

**Adding a brand-new product** (not from the legacy site): add its image to `content/site-images.json`-style
sources or extend `scripts/build-catalog.mjs` with a `content/products-extra.json` input. A headless CMS is the
recommended long-term option (see the audit report).

## Enquiries (forms)

The quote form posts to **FormSubmit** (`https://formsubmit.co/info@skstonesindia.com`), the same relay the
legacy site used, so submissions keep arriving in the same inbox. Spam protection: FormSubmit reCAPTCHA
(`_captcha=true`), a honeypot field, and a minimum-time-to-submit check. No secrets are stored in the site.

After a successful submit FormSubmit redirects to `/thank-you`. The first submission from a new domain may
require clicking FormSubmit's activation email once.

## Deployment (Netlify)

1. Push this repository to GitHub/GitLab and **Add new site → Import an existing project** in Netlify.
2. Build settings are read from `netlify.toml`: build command `npm run build`, publish directory `out`, Node 22.
3. Deploy the branch and test the **deploy preview URL** (run the checklist below) before switching DNS.
4. In **Domain management**, attach `skstonesindia.com` (and `www`), enable HTTPS.
5. In Google Search Console, submit `https://skstonesindia.com/sitemap.xml`.

`out/_redirects` (generated) permanently redirects every legacy `*.html` URL to its pretty URL, plus
`/quatrz-surfaces → /quartz-surfaces` and three retired empty pages. `out/_headers` sets long-lived caching for
hashed assets and security headers.

**Post-deploy checklist:** homepage, a catalog page with filters, product lightbox, shortlist → quote form,
a real test enquiry reaching `info@skstonesindia.com`, `/about.html` → `/about` (301), `/sitemap.xml`, and a
Lighthouse run against the live URL.

> Production deploys require explicit approval from the site owner.
