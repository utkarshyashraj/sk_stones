/* Shared mobile navigation — drawer (secondary) + bottom bar (primary) */
(function () {
    const MOBILE_BP = 1024;

    const ICONS = {
        home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
        about: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.25"/><path d="M5.5 19.5c1.6-3.2 4-4.75 6.5-4.75s4.9 1.55 6.5 4.75"/></svg>',
        products: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/><path d="M9 11v2"/><path d="M15 11v2"/></svg>',
        services: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3 17.7 9.3"/><path d="M5.5 14.5 15 5a3.5 3.5 0 0 1 4 4 3.5 3.5 0 0 1 0 4L9.5 18.5h-4v-4z"/></svg>',
        more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.75" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.75" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.75" fill="currentColor" stroke="none"/></svg>'
    };

    const PRODUCT_PAGES = new Set([
        'products.html', 'marbles.html', 'indian-marbles.html', 'imported-marbles.html',
        'indian-marble-polished-slabs.html', 'indian-marble-unpolished.html', 'imported-marble-polished.html',
        'granites.html', 'imported-granites.html', 'natural-stones.html', 'cobble-stones.html',
        'kota-stones.html', 'pebbles.html', 'sand-stones.html', 'engineered-surfaces.html',
        'acrylic-surfaces.html', 'quatrz-surfaces.html', 'wall-claddings.html', 'tiles.html',
        'brillo-collection.html', 'elezzo-collection.html', 'endless-collection.html',
        'ittaca-collection.html', 'milagro-collection.html', 'stone-collection.html',
        'subway-tiles.html', 'clay-products.html', 'clay-jally.html', 'wire-cut-bricks.html',
        'elevation-clay-bricks.html', 'roofing-tiles-clay.html', 'roof-flooring-tiles.html',
        'stone-art.html', 'cnc-stone-work.html', 'mop-inlay-work.html', 'murals-monuments.html',
        'feature-wall.html', 'concrete-blocks.html'
    ]);

    const SERVICE_PAGES = new Set([
        'installations.html', 'landscaping.html', 'flooring-executions.html',
        'stone-art-installations.html'
    ]);

    const MORE_PAGES = new Set([
        'projects.html', 'contact.html', 'thank-you.html'
    ]);

    function currentPage() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }

    function activeTab() {
        const page = currentPage();
        if (page === 'index.html' || page === '' || page === '/') return 'home';
        if (page === 'about.html') return 'about';
        if (PRODUCT_PAGES.has(page)) return 'products';
        if (SERVICE_PAGES.has(page)) return 'services';
        if (MORE_PAGES.has(page) || page.indexOf('case-study') === 0) return 'more';
        return '';
    }

    function mobileNavHTML() {
        return `
        <button type="button" class="close-nav" id="closeNav" aria-label="Close menu">&times;</button>
        <div class="mobile-nav-scroll">
            <a href="index.html" class="mobile-link" data-page="index.html">Home</a>
            <a href="about.html" class="mobile-link" data-page="about.html">About Us</a>

            <details class="mobile-details">
                <summary>Services</summary>
                <div class="mobile-sub">
                    <a href="installations.html">Installations</a>
                    <a href="landscaping.html">Landscaping</a>
                    <a href="flooring-executions.html">Flooring Executions</a>
                    <a href="stone-art-installations.html">Stone Art Installations</a>
                </div>
            </details>

            <details class="mobile-details">
                <summary>Products</summary>
                <div class="mobile-sub">
                    <details class="mobile-details nested">
                        <summary>Marbles</summary>
                        <div class="mobile-sub">
                            <a href="indian-marbles.html">Indian Marbles</a>
                            <a href="imported-marbles.html">Imported Marbles</a>
                        </div>
                    </details>
                    <details class="mobile-details nested">
                        <summary>Granites</summary>
                        <div class="mobile-sub">
                            <a href="granites.html">Indian Granites</a>
                            <a href="imported-granites.html">Imported Granites</a>
                        </div>
                    </details>
                    <details class="mobile-details nested">
                        <summary>Stone-Art</summary>
                        <div class="mobile-sub">
                            <a href="cnc-stone-work.html">CNC Stone Work &amp; INLAY Work</a>
                            <a href="mop-inlay-work.html">MOP Work</a>
                            <a href="murals-monuments.html">Murals &amp; Monuments</a>
                            <a href="feature-wall.html">Feature Walls</a>
                        </div>
                    </details>
                    <details class="mobile-details nested">
                        <summary>Natural Stones</summary>
                        <div class="mobile-sub">
                            <a href="cobble-stones.html">Cobble Stones</a>
                            <a href="kota-stones.html">Lime Stones</a>
                            <a href="pebbles.html">Pebbles</a>
                            <a href="sand-stones.html">Sand Stones</a>
                        </div>
                    </details>
                    <details class="mobile-details nested">
                        <summary>Engineered Surfaces</summary>
                        <div class="mobile-sub">
                            <a href="acrylic-surfaces.html">Acrylic Surfaces</a>
                            <a href="quatrz-surfaces.html">Quatrz Surfaces</a>
                        </div>
                    </details>
                    <a href="wall-claddings.html" class="mobile-link-plain">Wall Claddings</a>
                    <details class="mobile-details nested">
                        <summary>Tiles</summary>
                        <div class="mobile-sub">
                            <a href="brillo-collection.html">Brillo Collection</a>
                            <a href="elezzo-collection.html">Elezzo Collection</a>
                            <a href="endless-collection.html">Endless Collection</a>
                            <a href="ittaca-collection.html">Ittaca Collection</a>
                            <a href="milagro-collection.html">Milagro Collection</a>
                            <a href="stone-collection.html">Stone Collection</a>
                            <a href="subway-tiles.html">Subway Tiles</a>
                        </div>
                    </details>
                    <details class="mobile-details nested">
                        <summary>Clay Products</summary>
                        <div class="mobile-sub">
                            <a href="clay-jally.html">Clay Jally</a>
                            <a href="wire-cut-bricks.html">Wire Cut Bricks</a>
                            <a href="elevation-clay-bricks.html">Elevation Clay Bricks</a>
                            <a href="roofing-tiles-clay.html">Roofing Tiles</a>
                            <a href="roof-flooring-tiles.html">Roof Flooring Tiles</a>
                        </div>
                    </details>
                </div>
            </details>

            <a href="projects.html" class="mobile-link" data-page="projects.html">Our Projects</a>
        </div>
        <div class="mobile-nav-footer">
            <a href="contact.html" class="mobile-nav-cta" data-page="contact.html">Contact Us</a>
            <a href="tel:+917022630994" class="mobile-nav-call"><i class="fas fa-phone"></i> Call Now</a>
        </div>`;
    }

    function bottomNavHTML() {
        const tab = activeTab();
        const item = (key, label, attrs) => {
            const active = tab === key ? ' is-active' : '';
            return `<button type="button" class="mnav-item${active}" data-mnav="${key}" ${attrs}>${ICONS[key]}<span>${label}</span></button>`;
        };
        const link = (key, label, href) => {
            const active = tab === key ? ' is-active' : '';
            return `<a href="${href}" class="mnav-item${active}" data-mnav="${key}">${ICONS[key]}<span>${label}</span></a>`;
        };

        return `
        <nav class="mobile-bottom-nav" id="mobileBottomNav" aria-label="Primary mobile navigation">
            ${link('home', 'Home', 'index.html')}
            ${link('about', 'About Us', 'about.html')}
            ${item('products', 'Products', 'aria-haspopup="dialog" aria-controls="mnavSheetProducts"')}
            ${item('services', 'Services', 'aria-haspopup="dialog" aria-controls="mnavSheetServices"')}
            ${item('more', 'More', 'aria-haspopup="dialog" aria-controls="mnavSheetMore"')}
        </nav>`;
    }

    function sheetsHTML() {
        return `
        <div class="mnav-sheet-root" id="mnavSheetRoot">
            <div class="mnav-sheet-overlay" id="mnavSheetOverlay" hidden></div>

            <div class="mnav-sheet" id="mnavSheetProducts" role="dialog" aria-modal="true" aria-labelledby="mnavProductsTitle" hidden>
                <div class="mnav-sheet-handle" aria-hidden="true"></div>
                <div class="mnav-sheet-header">
                    <h2 id="mnavProductsTitle">Products</h2>
                    <button type="button" class="mnav-sheet-close" data-mnav-close aria-label="Close">&times;</button>
                </div>
                <div class="mnav-sheet-body">
                    <a class="mnav-sheet-link" href="indian-marbles.html">Indian Marble</a>
                    <a class="mnav-sheet-link" href="imported-marbles.html">Imported Marble</a>
                    <a class="mnav-sheet-link" href="granites.html">Granite</a>
                    <a class="mnav-sheet-link" href="imported-granites.html">Imported Granite</a>
                    <a class="mnav-sheet-link" href="quatrz-surfaces.html">Quartz</a>
                    <a class="mnav-sheet-link" href="kota-stones.html">Limestone</a>
                    <a class="mnav-sheet-link" href="sand-stones.html">Sandstone</a>
                    <a class="mnav-sheet-link" href="natural-stones.html">Natural Stones</a>
                    <a class="mnav-sheet-link" href="wall-claddings.html">Wall Claddings</a>
                    <a class="mnav-sheet-link" href="tiles.html">Tiles</a>
                    <a class="mnav-sheet-link" href="engineered-surfaces.html">Engineered Surfaces</a>
                    <a class="mnav-sheet-link" href="clay-products.html">Clay Products</a>
                    <a class="mnav-sheet-link" href="stone-art.html">Stone Art</a>
                    <a class="mnav-sheet-link" href="roofing-tiles-clay.html">Roofing</a>
                    <a class="mnav-sheet-link" href="products.html">View All Products</a>
                </div>
            </div>

            <div class="mnav-sheet" id="mnavSheetServices" role="dialog" aria-modal="true" aria-labelledby="mnavServicesTitle" hidden>
                <div class="mnav-sheet-handle" aria-hidden="true"></div>
                <div class="mnav-sheet-header">
                    <h2 id="mnavServicesTitle">Services</h2>
                    <button type="button" class="mnav-sheet-close" data-mnav-close aria-label="Close">&times;</button>
                </div>
                <div class="mnav-sheet-body">
                    <a class="mnav-sheet-link" href="flooring-executions.html">Flooring</a>
                    <a class="mnav-sheet-link" href="installations.html">Installation</a>
                    <a class="mnav-sheet-link" href="landscaping.html">Landscaping</a>
                    <a class="mnav-sheet-link" href="stone-art-installations.html">Stone Art</a>
                    <a class="mnav-sheet-link" href="contact.html">Consultation</a>
                </div>
            </div>

            <div class="mnav-sheet" id="mnavSheetMore" role="dialog" aria-modal="true" aria-labelledby="mnavMoreTitle" hidden>
                <div class="mnav-sheet-handle" aria-hidden="true"></div>
                <div class="mnav-sheet-header">
                    <h2 id="mnavMoreTitle">More</h2>
                    <button type="button" class="mnav-sheet-close" data-mnav-close aria-label="Close">&times;</button>
                </div>
                <div class="mnav-sheet-body">
                    <div class="mnav-sheet-section">
                        <a class="mnav-sheet-link" href="index.html#testimonials">Testimonials</a>
                        <a class="mnav-sheet-link" href="index.html#faq">FAQ</a>
                        <a class="mnav-sheet-link" href="projects.html">Projects</a>
                    </div>
                    <div class="mnav-sheet-section">
                        <p class="mnav-sheet-section-title">Connect</p>
                        <div class="mnav-social">
                            <a href="https://www.linkedin.com/in/shree-kumar-gandhi-8699533a6/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                            <a href="https://wa.me/917022630994" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                            <a href="mailto:info@skstonesindia.com" aria-label="Email"><i class="fas fa-envelope"></i></a>
                            <a href="tel:+917022630994" aria-label="Call"><i class="fas fa-phone"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    function closeDrawer() {
        const mobileNav = document.getElementById('mobileNav');
        const navOverlay = document.getElementById('navOverlay');
        const menuToggle = document.getElementById('menuToggle');
        if (mobileNav) mobileNav.classList.remove('active');
        if (navOverlay) navOverlay.classList.remove('active');
        if (menuToggle) menuToggle.classList.remove('active');
        if (!document.querySelector('.mnav-sheet.is-open')) {
            document.body.style.overflow = '';
        }
    }

    function openDrawer() {
        closeAllSheets();
        const mobileNav = document.getElementById('mobileNav');
        const navOverlay = document.getElementById('navOverlay');
        const menuToggle = document.getElementById('menuToggle');
        if (mobileNav) mobileNav.classList.add('active');
        if (navOverlay) navOverlay.classList.add('active');
        if (menuToggle) menuToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function markActivePage() {
        const path = currentPage();
        document.querySelectorAll('.mobile-link[data-page], .mobile-nav-cta[data-page]').forEach((link) => {
            if (link.dataset.page === path) link.classList.add('active');
        });
    }

    function closeAllSheets() {
        document.querySelectorAll('.mnav-sheet.is-open').forEach((sheet) => {
            sheet.classList.remove('is-open');
            sheet.setAttribute('hidden', '');
        });
        const overlay = document.getElementById('mnavSheetOverlay');
        if (overlay) {
            overlay.classList.remove('is-open');
            overlay.setAttribute('hidden', '');
        }
        document.body.classList.remove('mnav-sheet-open');
        document.querySelectorAll('.mnav-item[aria-expanded="true"]').forEach((el) => {
            el.setAttribute('aria-expanded', 'false');
        });
        if (!document.getElementById('mobileNav')?.classList.contains('active')) {
            document.body.style.overflow = '';
        }
    }

    function openSheet(name) {
        closeDrawer();
        closeAllSheets();
        const sheet = document.getElementById(
            name === 'products' ? 'mnavSheetProducts'
                : name === 'services' ? 'mnavSheetServices'
                    : 'mnavSheetMore'
        );
        const overlay = document.getElementById('mnavSheetOverlay');
        if (!sheet || !overlay) return;

        sheet.removeAttribute('hidden');
        overlay.removeAttribute('hidden');
        // Force reflow for transition
        void sheet.offsetWidth;
        sheet.classList.add('is-open');
        overlay.classList.add('is-open');
        document.body.classList.add('mnav-sheet-open');
        document.body.style.overflow = 'hidden';

        const trigger = document.querySelector(`.mnav-item[data-mnav="${name}"]`);
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
    }

    function ensureBottomNav() {
        if (document.getElementById('mobileBottomNav')) return;

        const wrap = document.createElement('div');
        wrap.innerHTML = bottomNavHTML() + sheetsHTML();
        while (wrap.firstChild) {
            document.body.appendChild(wrap.firstChild);
        }

        const overlay = document.getElementById('mnavSheetOverlay');
        if (overlay) overlay.addEventListener('click', closeAllSheets);

        document.querySelectorAll('[data-mnav-close]').forEach((btn) => {
            btn.addEventListener('click', closeAllSheets);
        });

        document.querySelectorAll('.mnav-item[data-mnav]').forEach((el) => {
            const key = el.getAttribute('data-mnav');
            if (key === 'home' || key === 'about') return;
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const open = document.getElementById(
                    key === 'products' ? 'mnavSheetProducts'
                        : key === 'services' ? 'mnavSheetServices'
                            : 'mnavSheetMore'
                );
                if (open && open.classList.contains('is-open')) {
                    closeAllSheets();
                } else {
                    openSheet(key);
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeAllSheets();
        });
    }

    function initHomepageDrawer() {
        /* Hamburger flyout retired — bottom nav is primary on mobile */
        return;
    }

    function initNavLinksDropdowns() {
        /* Desktop mega-menu only; no mobile accordion flyout */
        return;
    }

    function initHamburgerFallback() {
        return;
    }

    document.addEventListener('DOMContentLoaded', () => {
        ensureBottomNav();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > MOBILE_BP) {
            closeAllSheets();
        }
    });
})();
