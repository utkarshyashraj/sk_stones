import Link from 'next/link';
import { Fa } from '@/components/ref/Fa';
import { RefImg } from '@/components/ref/RefImg';
import { RefShell } from '@/components/ref/RefShell';
import { cardPage, imageOf } from '@/lib/ref-catalog';
import { pageMetadata } from '@/lib/ref-seo';
import '@/styles/ref/product.css';

export const metadata = pageMetadata('products', '/products');

/** Reference "Our Products" overview: hero panel + one card per collection ("Know More"). */
export default function ProductsPage() {
  const cards = cardPage('products')!.cards;
  return (
    <RefShell bundle="product" nav="products" tab="products" footer="container-grid" headerScrolled>
      <section className="page-hero product-hero-panel">
        <div className="product-hero-top">
          <div className="page-hero-content product-hero-panel-inner">
            <span className="page-badge">Our Collection</span>
            <h1>
              Our <span className="gold">Products</span>
            </h1>
            <p>
              We offer a curated range of premium marbles, granites, natural stones, engineered surfaces,
              stone art, and cladding solutions selected for quality, durability, and design versatility.
            </p>
            <div className="page-hero-actions">
              <a href="#products" className="btn btn-primary">
                Explore Collection
              </a>
              <Link className="btn btn-outline-light" href="/contact">
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="products-page" id="products">
        <div className="container">
          <div className="products-categories">
            {cards.map((c) => {
              const img = imageOf(c.image);
              return (
                <div key={c.href} className="category-card">
                  <div className="category-image">
                    {img ? <RefImg image={img} alt={c.name} sizes="(min-width: 1025px) 33vw, 90vw" /> : null}
                    <div className="category-overlay">
                      <Link className="btn btn-primary" href={c.href}>
                        Know More
                      </Link>
                    </div>
                  </div>
                  <div className="category-info">
                    <h3>{c.name}</h3>
                    <p>{c.description}</p>
                    <Link className="category-link" href={c.href}>
                      Know More <Fa name="arrow-right" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="sk-helpers">
            <p>Not sure which stone suits your project?</p>
            <button
              type="button"
              className="sk-btn sk-btn--gold"
              data-sk-open="guide"
              data-sk-click=""
              data-sk-prefetch=""
            >
              Help me choose
            </button>
          </div>
          <div id="sk-recent-products" data-sk-recent="" />
        </div>
      </section>
    </RefShell>
  );
}
