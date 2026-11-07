'use client';

import { useEffect } from 'react';

/**
 * About page behaviour from the reference: on desktop the purpose and founder images match the height of
 * their text panels; team cards fade in one after another when scrolled into view; the logo, purpose and
 * why-card rows can be dragged sideways with a mouse (phones swipe natively).
 */
export function AboutEnhance() {
  useEffect(() => {
    const sync = () => {
      const pairs: [string, string, (h: number) => number][] = [
        ['purposeContent', 'purposeImage', (h) => Math.max(320, Math.round(h))],
        ['founderContent', 'founderImage', (h) => Math.max(280, Math.round(h * 0.88))],
      ];
      for (const [c, i, f] of pairs) {
        const content = document.getElementById(c);
        const img = document.getElementById(i);
        if (!content || !img) continue;
        img.style.height = window.innerWidth <= 1024 ? '' : `${f(content.getBoundingClientRect().height)}px`;
      }
    };
    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('load', sync);
    document.fonts?.ready.then(sync);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = document.querySelectorAll<HTMLElement>('#teamFounder, .team-card');
    const timers: number[] = [];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          timers.push(
            window.setTimeout(() => el.classList.add('visible'), reduce ? 0 : Number(el.dataset.delay || 0)),
          );
          io.unobserve(el);
        }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    );
    cards.forEach((c) => io.observe(c));

    const off: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>('.trusted-logos, .purpose-cards, .why-cards').forEach((el) => {
      let down = false;
      let startX = 0;
      let start = 0;
      const pd = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        down = true;
        startX = e.clientX;
        start = el.scrollLeft;
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-dragging');
      };
      const pu = (e: PointerEvent) => {
        if (!down) return;
        down = false;
        el.classList.remove('is-dragging');
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          // pointer already released
        }
      };
      const pm = (e: PointerEvent) => {
        if (!down || e.pointerType !== 'mouse') return;
        e.preventDefault();
        el.scrollLeft = start - (e.clientX - startX) * 1.2;
      };
      el.addEventListener('pointerdown', pd);
      el.addEventListener('pointerup', pu);
      el.addEventListener('pointercancel', pu);
      el.addEventListener('pointermove', pm);
      off.push(() => {
        el.removeEventListener('pointerdown', pd);
        el.removeEventListener('pointerup', pu);
        el.removeEventListener('pointercancel', pu);
        el.removeEventListener('pointermove', pm);
      });
    });
    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('load', sync);
      io.disconnect();
      timers.forEach(clearTimeout);
      off.forEach((f) => f());
    };
  }, []);
  return null;
}
