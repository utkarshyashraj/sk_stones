import Link from 'next/link';
import { fromLightboxItems } from '@/lib/filter-stones';
import { emptyState, MIN_STONES_FOR_FILTERS, visibleFacets } from '@/lib/filters';
import { stoneItem } from '@/lib/lightbox-items';
import {
  attributeCoverage,
  cardPage,
  categoryTrail,
  imageOf,
  productsOf,
  type RefCategory,
} from '@/lib/ref-catalog';
import { Fa } from './Fa';
import { FilterBarView } from './FilterBarView';
import { careGuideFor } from '@/content/care-guides';
import { stoneTypeFor } from '@/lib/quote-prefill';
import { breadcrumbLd } from '@/lib/seo';
import { JsonLd } from './JsonLd';
import { LightboxData } from './LightboxData';
import { RefImg } from './RefImg';
import { RefShell } from './RefShell';

/**
 * The reference's shared product-page layout, driven entirely by catalogue data: hero panel, product
 * overview (collection pages), then either the product grid (with the fullscreen viewer + magnifier) or,
 * for the Marbles overview, the collection cards. One template for every product, hub and collection route.
 */
export function ProductPageTemplate({ category }: { category: RefCategory }) {
  const page = category.refPage!;
  const products = productsOf(category);
  const care = careGuideFor(stoneTypeFor(products.map((p) => p.category)));
  const cards = cardPage(category.slug);
  const overviewImg = imageOf(category.overview?.image ?? null);
  // Filter bar: only on grids of 8+ stones, offering the facets this page's data supports.
  const filterStones = cards ? [] : fromLightboxItems(products.map(stoneItem));
  const cov = attributeCoverage();
  const filters =
    filterStones.length >= MIN_STONES_FOR_FILTERS
      ? {
          keys: visibleFacets(
            filterStones,
            Object.fromEntries(Object.entries(cov.fields).map(([k, v]) => [k, v.share])),
            cov.threshold,
          ),
          label: category.name,
          countLabel: page.countLabel,
        }
      : null;
  return (
    <RefShell
      bundle="product"
      nav="products"
      tab="products"
      footer="bottom-only"
      headerScrolled
      backToTop={false}
    >
      <JsonLd data={breadcrumbLd(categoryTrail(category))} />
      <section className="page-hero product-hero-banner product-hero-panel">
        <div className="product-hero-top">
          <div className="page-hero-content product-hero-panel-inner">
            <p className="page-hero-tagline" dangerouslySetInnerHTML={{ __html: page.hero.taglineHtml }} />
            <h1 dangerouslySetInnerHTML={{ __html: page.hero.h1Html }} />
            <p className="page-hero-description">{page.hero.description}</p>
            <div className="page-hero-actions">
              <a href="#product-grid" className="btn btn-primary">
                {cards ? 'Explore Collections' : 'Explore Our Collection'}
              </a>
              <Link className="btn btn-outline-light" href="/contact">
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {category.overview ? (
        <section className="product-overview-section">
          <div className="container">
            <div className="product-overview-grid">
              {overviewImg ? (
                <div className="product-overview-image">
                  <RefImg
                    image={overviewImg}
                    alt="Product Overview"
                    sizes="(min-width: 1025px) 520px, 90vw"
                  />
                </div>
              ) : null}
              <div className="product-overview-content">
                <h2>
                  Product <span className="highlight">Overview</span>
                </h2>
                {/* Reference copy, verbatim; only <p>, <ul>, <li>, <br> occur (built from the snapshot). */}
                <div
                  className="product-overview-text"
                  dangerouslySetInnerHTML={{ __html: category.overview.html }}
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="product-grid-section" id="product-grid">
        <div className="container">
          <div className="product-grid-header">
            <h2>{page.gridTitle}</h2>
            <p className="product-count">{page.countLabel}</p>
          </div>
          {cards ? (
            <div className="products-categories" style={{ maxWidth: 900, margin: '0 auto' }}>
              {cards.cards.map((c) => {
                const img = imageOf(c.image);
                return (
                  <div key={c.href} className="category-card">
                    <div className="category-image">
                      {img ? (
                        <RefImg image={img} alt={c.name} sizes="(min-width: 1025px) 440px, 90vw" />
                      ) : null}
                      <div className="category-overlay">
                        <Link className="btn btn-primary" href={c.href}>
                          View Collection
                        </Link>
                      </div>
                    </div>
                    <div className="category-info">
                      <h3>{c.name}</h3>
                      <p>{c.description}</p>
                      <Link className="category-link" href={c.href}>
                        View Collection <Fa name="arrow-right" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              {filters ? (
                <div className="sk-filter-host">
                  <div id="sk-filter-skeleton" data-sk-skeleton="">
                    <FilterBarView keys={filters.keys} state={emptyState()} label={filters.label} />
                  </div>
                  <div id="sk-filter-mount" data-config={JSON.stringify(filters)} />
                </div>
              ) : null}
              <div className="product-grid">
                {products.map((p) => {
                  const img = imageOf(p.image);
                  return (
                    <div key={p.id} className="product-item product-item-clickable" data-sk-id={p.id}>
                      <div
                        className="product-item-image"
                        role="button"
                        tabIndex={0}
                        data-sk-click=""
                        aria-label={`View ${p.name} full screen`}
                      >
                        {img ? (
                          <RefImg image={img} alt={p.name} sizes="(min-width: 1025px) 280px, 45vw" />
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="sk-save"
                        data-save-id={p.id}
                        data-save-name={p.name}
                        data-sk-click=""
                        aria-pressed="false"
                        aria-label={`Save ${p.name}`}
                      >
                        <Fa name="bookmark" />
                      </button>
                      <div className="product-item-info">
                        <h4>{p.name}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filters ? (
                <div id="sk-filter-empty" className="sk-filter-empty" hidden>
                  <p>No stones match these filters.</p>
                  <div className="sk-btn-row">
                    <button type="button" className="sk-btn sk-btn--gold" data-sk-filter-clear="">
                      Clear filters
                    </button>
                    <Link className="sk-btn sk-btn--ghost" href="/contact">
                      Ask us for this stone
                    </Link>
                  </div>
                </div>
              ) : null}
              <div className="sk-helpers">
                <p>Not sure how much stone you need?</p>
                <button
                  type="button"
                  className="sk-btn sk-btn--ghost"
                  data-sk-open="calculator"
                  data-sk-click=""
                >
                  Calculate area
                </button>
              </div>
            </>
          )}
          {care ? (
            <p className="sk-care-link">
              <Link href={`/care/${care.slug}`}>{care.title} — cleaning and upkeep tips</Link>
            </p>
          ) : null}
          <div id="sk-recent-product" data-sk-recent="" />
        </div>
      </section>
      {cards ? null : (
        <LightboxData grid=".product-grid" item=".product-item" items={products.map(stoneItem)} />
      )}
    </RefShell>
  );
}
