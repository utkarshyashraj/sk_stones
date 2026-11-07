# S K Stones India — website

Marketing site and stone catalogue for **S K Stones India** (formerly Shree Stones & Services), Bengaluru.
Built with **Next.js 16 (App Router) + React 19 + TypeScript**, exported as **static HTML** (GitHub Pages; Netlify-ready).

The design, copy and behaviour are a port of the approved reference site, **https://skstone.netlify.app/**, snapshotted
into `legacy/`. Its own CSS is compiled into one scoped stylesheet per page type (`scripts/build-ref-styles.mjs`).

- 46 pre-rendered pages (43 indexable), 444 products across 35 product pages, no runtime server.
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

| Command                 | What it checks                                                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`     | TypeScript strict mode (`noUncheckedIndexedAccess` on)                                                                                       |
| `npm run lint`          | ESLint (Next.js core-web-vitals + TypeScript rules, React hooks rules)                                                                       |
| `npm run format:check`  | Prettier                                                                                                                                     |
| `npm test`              | Vitest unit tests — reference routes, redirects for retired/renamed URLs, catalogue integrity                                                |
| `npm run build`         | Production static export (fails on type errors)                                                                                              |
| `npm run verify:routes` | Crawls `out/`: sitemap ↔ pages, every internal link and image, unique titles/descriptions, canonical/OG, one `<h1>`, JSON-LD, redirects      |
| `npm run test:e2e`      | Playwright: homepage sections/counters/FAQ/sliders, mega menu, mobile bar, lightbox + magnifier, contact form, SEO tags, redirects, 8 widths |
| `npm run lighthouse`    | Lighthouse mobile + desktop on key pages (needs `npm start` running and `CHROME_PATH`); `-- --runs=3` reports medians                        |
| `npm run check`         | All of the above except Lighthouse                                                                                                           |

CI (`.github/workflows/ci.yml`) runs the same gates on every push and pull request.

## Project structure

```
app/                     Routes (App Router)
  page.tsx               Homepage (reference sections, in order)
  [slug]/                Every product, hub and collection page from one template (ProductPageTemplate)
  products/ about/ projects/ contact/ thank-you/ not-found.tsx
  landscaping/ flooring-executions/ stone-art-installations/ installations/   (ServicePageTemplate)
  sitemap.ts robots.ts   Generated at build time
components/ref/          RefShell (page frame), Header, Footer, MobileBottomNav, SectionHeading, ServiceCard,
                         FAQAccordion, Lightbox (+ magnifier), ContactFormModal, templates, RefImg, Fa (icons)
content/
  nav.ts                 Header menus and mobile sheets (reference labels)                ← edit
  ref/                   Page copy from the reference (home, about, projects, services) + seo.json  ← edit
  categories.json        Product pages: URL, grouping, which reference page they come from  ← edit
  catalog-corrections.json  Verified product-name fixes (matched by image filename)        ← edit
  site-images.json, ref-images.json  Page images (reference src -> optimised copy)
  generated/             catalog.json, image-jobs.json, images.json (GENERATED — do not edit)
lib/                     site (business details), ref-catalog, ref-seo, seo (JSON-LD), routes, image helpers
styles/ref/              GENERATED page stylesheets (scripts/build-ref-styles.mjs); styles/base.css document basics
public/images/, media/   Optimised images and the homepage video
scripts/                 Reference snapshot + extraction, catalogue, styles, SEO, images, postbuild, verifier
legacy/                  Snapshot of the approved reference site (HTML/CSS/JS/images; not deployed)
```

## Editing content

**Business details** (phone, email, both offices, form destination): `lib/site.ts`.

**Page copy**: `content/ref/*.ts`; navigation: `content/nav.ts`; page titles/descriptions: `content/ref/seo.json`.

**If the reference site changes**, re-run the pipeline:

```bash
node scripts/snapshot-reference.mjs   # skstone.netlify.app -> legacy/
npm run catalog:extract               # product pages -> content/raw/legacy-catalog.json
node scripts/collect-ref-images.mjs   # page images -> content/ref-images.json + site-images.json
node scripts/extract-ref-seo.mjs      # titles/descriptions/OG -> content/ref/seo.json
node scripts/build-ref-styles.mjs     # reference CSS -> styles/ref/*.css
npm run catalog:download && npm run catalog:build && npm run images:optimize
```

To rename or re-label a product, add a rule to `content/catalog-corrections.json` (matched by image filename,
never by position) and run `npm run catalog:build`.

## Enquiries (forms)

The contact page's "Open Form" buttons open the reference quote form, which posts to **FormSubmit**
(`https://formsubmit.co/info@skstonesindia.com`) with a honeypot field and browser validation (name, phone,
email and stone type are required), as on the reference. FormSubmit then redirects to `/thank-you`. The first
submission from a new domain needs FormSubmit's activation email clicked once.

## Deployment (Netlify)

1. Push this repository to GitHub/GitLab and **Add new site → Import an existing project** in Netlify.
2. Build settings are read from `netlify.toml`: build command `npm run build`, publish directory `out`, Node 22.
3. Deploy the branch and test the **deploy preview URL** (run the checklist below) before switching DNS.
4. In **Domain management**, attach `skstonesindia.com` (and `www`), enable HTTPS.
5. In Google Search Console, submit `https://skstonesindia.com/sitemap.xml`.

`out/_redirects` (generated) permanently redirects every legacy `*.html` URL to its pretty URL, plus renamed or
retired pages: `/quartz-surfaces → /quatrz-surfaces`, `/indian-granites → /granites`, `/case-study-* → /projects`,
`/search → /products`. (The GitHub Pages build writes small redirect pages instead.) `out/_headers` sets long-lived caching for
hashed assets and security headers.

**Post-deploy checklist:** homepage, a product page and its lightbox, the contact form,
a real test enquiry reaching `info@skstonesindia.com`, `/about.html` → `/about` (301), `/sitemap.xml`, and a
Lighthouse run against the live URL.

> Production deploys require explicit approval from the site owner.
