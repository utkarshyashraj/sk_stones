/* Fullscreen product image viewer + magnifier for product grid pages */
(function () {
    const MAG_SIZE = 180;
    const MAG_ZOOM = 2.6;

    function initProductLightbox() {
        const grid = document.querySelector('.product-grid');
        if (!grid) return;

        const items = [...grid.querySelectorAll('.product-item')].filter((item) => item.querySelector('img'));
        if (!items.length) return;

        const products = items.map((item) => {
            const img = item.querySelector('img');
            const title = item.querySelector('h4');
            return {
                src: img.currentSrc || img.src,
                alt: title ? title.textContent.trim() : img.alt || 'Product',
            };
        });

        const lightbox = document.createElement('div');
        lightbox.className = 'product-lightbox';
        lightbox.id = 'productLightbox';
        lightbox.innerHTML = `
            <button type="button" class="product-lightbox-close" aria-label="Close">&times;</button>
            <button type="button" class="product-lightbox-nav product-lightbox-prev" aria-label="Previous product">
                <i class="fas fa-chevron-left"></i>
            </button>
            <div class="product-lightbox-stage">
                <div class="product-lightbox-frame">
                    <img src="" alt="" id="productLightboxImg">
                    <div class="product-magnifier" id="productMagnifier" aria-hidden="true"></div>
                </div>
            </div>
            <button type="button" class="product-lightbox-nav product-lightbox-next" aria-label="Next product">
                <i class="fas fa-chevron-right"></i>
            </button>
            <div class="product-lightbox-meta">
                <p class="product-lightbox-title" id="productLightboxTitle"></p>
                <p class="product-lightbox-counter" id="productLightboxCounter"></p>
                <p class="product-lightbox-hint" id="productLightboxHint">Hover or touch the image to magnify</p>
            </div>
        `;
        document.body.appendChild(lightbox);

        const imgEl = lightbox.querySelector('#productLightboxImg');
        const frameEl = lightbox.querySelector('.product-lightbox-frame');
        const lensEl = lightbox.querySelector('#productMagnifier');
        const titleEl = lightbox.querySelector('#productLightboxTitle');
        const counterEl = lightbox.querySelector('#productLightboxCounter');
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
            magnifying = false;
            lensEl.classList.remove('is-visible');
            frameEl.classList.remove('is-magnifying');
        }

        function showMagnifier(clientX, clientY) {
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
            currentIndex = (index + products.length) % products.length;
            const product = products[currentIndex];
            imgEl.src = product.src;
            imgEl.alt = product.alt;
            titleEl.textContent = product.alt;
            counterEl.textContent = `${currentIndex + 1} / ${products.length}`;
            prevBtn.style.visibility = products.length > 1 ? 'visible' : 'hidden';
            nextBtn.style.visibility = products.length > 1 ? 'visible' : 'hidden';
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
            lensEl.style.backgroundImage = '';
        }

        function step(delta) {
            hideMagnifier();
            render(currentIndex + delta);
        }

        items.forEach((item, index) => {
            item.classList.add('product-item-clickable');
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-label', `View ${products[index].alt} full screen`);

            item.addEventListener('click', () => open(index));
            item.addEventListener('keydown', (e) => {
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

        // Desktop magnifier
        frameEl.addEventListener('mousemove', (e) => {
            showMagnifier(e.clientX, e.clientY);
        });
        frameEl.addEventListener('mouseleave', hideMagnifier);
        frameEl.addEventListener('mouseenter', (e) => {
            showMagnifier(e.clientX, e.clientY);
        });

        // Touch magnifier — press & drag on image
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProductLightbox);
    } else {
        initProductLightbox();
    }
})();
