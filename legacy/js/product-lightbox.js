/* Fullscreen image viewer for product grids and gallery grids */
(function () {
    const MAG_SIZE = 180;
    const MAG_ZOOM = 2.6;

    function collectFromProductGrid(grid) {
        const items = [...grid.querySelectorAll('.product-item')].filter((item) => item.querySelector('img'));
        return items.map((item) => {
            const img = item.querySelector('img');
            const title = item.querySelector('h4');
            return {
                el: item,
                src: img.currentSrc || img.src,
                alt: title ? title.textContent.trim() : img.alt || 'Product',
            };
        });
    }

    function collectFromGalleryGrid(grid) {
        const items = [...grid.querySelectorAll('.gallery-item')].filter((item) => item.querySelector('img'));
        return items.map((item, index) => {
            const img = item.querySelector('img');
            const caption = item.querySelector('h3, h4, figcaption, .gallery-caption');
            const alt = (caption && caption.textContent.trim())
                || (img.alt && img.alt !== 'Gallery' ? img.alt.trim() : '')
                || `Gallery image ${index + 1}`;
            return {
                el: item,
                src: img.currentSrc || img.src,
                alt,
            };
        });
    }

    function createLightbox(entries, options) {
        if (!entries.length) return;

        const withMagnifier = options.magnifier !== false;
        const lightbox = document.createElement('div');
        lightbox.className = 'product-lightbox';
        lightbox.innerHTML = `
            <button type="button" class="product-lightbox-close" aria-label="Close">&times;</button>
            <button type="button" class="product-lightbox-nav product-lightbox-prev" aria-label="Previous">
                <i class="fas fa-chevron-left"></i>
            </button>
            <div class="product-lightbox-stage">
                <div class="product-lightbox-frame">
                    <img src="" alt="" class="product-lightbox-img">
                    ${withMagnifier ? '<div class="product-magnifier" aria-hidden="true"></div>' : ''}
                </div>
            </div>
            <button type="button" class="product-lightbox-nav product-lightbox-next" aria-label="Next">
                <i class="fas fa-chevron-right"></i>
            </button>
            <div class="product-lightbox-meta">
                <p class="product-lightbox-title"></p>
                <p class="product-lightbox-counter"></p>
                ${withMagnifier ? '<p class="product-lightbox-hint">Hover or touch the image to magnify</p>' : ''}
            </div>
        `;
        document.body.appendChild(lightbox);

        const imgEl = lightbox.querySelector('.product-lightbox-img');
        const frameEl = lightbox.querySelector('.product-lightbox-frame');
        const lensEl = lightbox.querySelector('.product-magnifier');
        const titleEl = lightbox.querySelector('.product-lightbox-title');
        const counterEl = lightbox.querySelector('.product-lightbox-counter');
        const closeBtn = lightbox.querySelector('.product-lightbox-close');
        const prevBtn = lightbox.querySelector('.product-lightbox-prev');
        const nextBtn = lightbox.querySelector('.product-lightbox-next');

        let currentIndex = 0;
        let touchStartX = 0;
        let touchStartY = 0;
        let magnifying = false;
        let suppressSwipe = false;

        function lensSize() {
            return window.innerWidth <= 768 ? 140 : MAG_SIZE;
        }

        function hideMagnifier() {
            if (!lensEl) return;
            magnifying = false;
            lensEl.classList.remove('is-visible');
            frameEl.classList.remove('is-magnifying');
        }

        function showMagnifier(clientX, clientY) {
            if (!lensEl) return;
            const rect = imgEl.getBoundingClientRect();
            if (!rect.width || !rect.height) {
                hideMagnifier();
                return;
            }

            const x = clientX - rect.left;
            const y = clientY - rect.top;
            if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
                hideMagnifier();
                return;
            }

            const size = lensSize();
            const half = size / 2;
            magnifying = true;
            frameEl.classList.add('is-magnifying');
            lensEl.classList.add('is-visible');

            let lensLeft = clientX - half;
            let lensTop = clientY - half;
            lensLeft = Math.max(8, Math.min(lensLeft, window.innerWidth - size - 8));
            lensTop = Math.max(8, Math.min(lensTop, window.innerHeight - size - 8));

            lensEl.style.width = `${size}px`;
            lensEl.style.height = `${size}px`;
            lensEl.style.left = `${lensLeft}px`;
            lensEl.style.top = `${lensTop}px`;

            const bgW = rect.width * MAG_ZOOM;
            const bgH = rect.height * MAG_ZOOM;
            const src = imgEl.currentSrc || imgEl.src;
            lensEl.style.backgroundImage = `url("${src}")`;
            lensEl.style.backgroundRepeat = 'no-repeat';
            lensEl.style.backgroundSize = `${bgW}px ${bgH}px`;
            lensEl.style.backgroundPosition = `${-(x * MAG_ZOOM - half)}px ${-(y * MAG_ZOOM - half)}px`;
        }

        function render(index) {
            hideMagnifier();
            currentIndex = (index + entries.length) % entries.length;
            const entry = entries[currentIndex];
            imgEl.src = entry.src;
            imgEl.alt = entry.alt;
            titleEl.textContent = entry.alt;
            counterEl.textContent = `${currentIndex + 1} / ${entries.length}`;
            prevBtn.style.visibility = entries.length > 1 ? 'visible' : 'hidden';
            nextBtn.style.visibility = entries.length > 1 ? 'visible' : 'hidden';
        }

        function open(index) {
            render(index);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function close() {
            hideMagnifier();
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            imgEl.removeAttribute('src');
            if (lensEl) lensEl.style.backgroundImage = '';
        }

        function step(delta) {
            hideMagnifier();
            render(currentIndex + delta);
        }

        entries.forEach((entry, index) => {
            entry.el.classList.add('product-item-clickable');
            entry.el.setAttribute('role', 'button');
            entry.el.setAttribute('tabindex', '0');
            entry.el.setAttribute('aria-label', `View ${entry.alt} full screen`);

            entry.el.addEventListener('click', () => open(index));
            entry.el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open(index);
                }
            });
        });

        closeBtn.addEventListener('click', close);
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            step(-1);
        });
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            step(1);
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('product-lightbox-stage')) close();
        });

        if (withMagnifier && lensEl) {
            frameEl.addEventListener('mousemove', (e) => {
                showMagnifier(e.clientX, e.clientY);
            });
            frameEl.addEventListener('mouseleave', hideMagnifier);
            frameEl.addEventListener('mouseenter', (e) => {
                showMagnifier(e.clientX, e.clientY);
            });

            frameEl.addEventListener('touchstart', (e) => {
                if (!e.changedTouches.length) return;
                const t = e.changedTouches[0];
                touchStartX = t.screenX;
                touchStartY = t.screenY;
                suppressSwipe = false;
                const rect = imgEl.getBoundingClientRect();
                if (
                    t.clientX >= rect.left && t.clientX <= rect.right &&
                    t.clientY >= rect.top && t.clientY <= rect.bottom
                ) {
                    showMagnifier(t.clientX, t.clientY);
                }
            }, { passive: true });

            frameEl.addEventListener('touchmove', (e) => {
                if (!e.changedTouches.length) return;
                const t = e.changedTouches[0];
                const dx = Math.abs(t.screenX - touchStartX);
                const dy = Math.abs(t.screenY - touchStartY);
                if (dx > 12 || dy > 12) suppressSwipe = true;
                if (magnifying || dy >= dx) {
                    if (e.cancelable) e.preventDefault();
                    showMagnifier(t.clientX, t.clientY);
                    suppressSwipe = true;
                }
            }, { passive: false });

            frameEl.addEventListener('touchend', () => {
                hideMagnifier();
            });
            frameEl.addEventListener('touchcancel', hideMagnifier);
        }

        lightbox.addEventListener('touchstart', (e) => {
            if (e.target.closest('.product-lightbox-frame')) return;
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            suppressSwipe = false;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            if (suppressSwipe || magnifying) return;
            if (e.target.closest('.product-lightbox-frame')) return;
            const diff = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(diff) < 50) return;
            step(diff > 0 ? -1 : 1);
        }, { passive: true });

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft') step(-1);
            if (e.key === 'ArrowRight') step(1);
        });
    }

    function initProductLightbox() {
        document.querySelectorAll('.product-grid').forEach((grid) => {
            createLightbox(collectFromProductGrid(grid), { magnifier: true });
        });

        document.querySelectorAll('.gallery-grid').forEach((grid) => {
            createLightbox(collectFromGalleryGrid(grid), { magnifier: true });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProductLightbox);
    } else {
        initProductLightbox();
    }
})();
