'use client';

import { useEffect } from 'react';

export interface LoopSlider {
  slider: string;
  left: string;
  right: string;
  item: string;
  gap: number;
}

/**
 * The reference pages' small scripts, applied to server-rendered markup inside the page wrapper:
 *  - `.reveal` sections fade up (class `visible`) when 12% is in view;
 *  - `.counter[data-target]` numbers count up from 0 the first time half of them is visible;
 *  - looping horizontal sliders scroll one card per arrow click and wrap at either end.
 * With prefers-reduced-motion, reveals and counters show their final state at once.
 */
export function Enhance({ sliders = [] }: { sliders?: LoopSlider[] }) {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: (() => void)[] = [];

    const reveals = document.querySelectorAll<HTMLElement>('.reveal');
    if (reduce || !('IntersectionObserver' in window)) reveals.forEach((el) => el.classList.add('visible'));
    else {
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
              io.unobserve(e.target);
            }
          }),
        { threshold: 0.12 },
      );
      reveals.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    const counters = document.querySelectorAll<HTMLElement>('.counter[data-target]');
    const finish = (c: HTMLElement) => {
      const t = parseFloat(c.dataset.target!);
      c.textContent = c.dataset.decimal === 'true' ? t.toFixed(1) : String(t);
    };
    const animate = (c: HTMLElement) => {
      const target = parseFloat(c.dataset.target!);
      const decimal = c.dataset.decimal === 'true';
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / 2000);
        const v = target * p;
        c.textContent =
          p < 1
            ? decimal
              ? v.toFixed(1)
              : String(Math.floor(v))
            : decimal
              ? target.toFixed(1)
              : String(target);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (reduce || !('IntersectionObserver' in window)) counters.forEach(finish);
    else {
      counters.forEach((c) => (c.textContent = '0'));
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              animate(e.target as HTMLElement);
              io.unobserve(e.target);
            }
          }),
        { threshold: 0.5 },
      );
      counters.forEach((c) => io.observe(c));
      cleanups.push(() => io.disconnect());
    }

    for (const s of sliders) {
      const slider = document.getElementById(s.slider);
      const left = document.getElementById(s.left);
      const right = document.getElementById(s.right);
      if (!slider) continue;
      const scroll = (dir: 1 | -1) => {
        const max = Math.max(0, slider.scrollWidth - slider.clientWidth);
        const step = (slider.querySelector<HTMLElement>(s.item)?.offsetWidth ?? 300) + s.gap;
        const behavior = reduce ? 'auto' : 'smooth';
        if (dir === 1 && slider.scrollLeft >= max - 2) slider.scrollTo({ left: 0, behavior });
        else if (dir === -1 && slider.scrollLeft <= 2) slider.scrollTo({ left: max, behavior });
        else slider.scrollBy({ left: dir * step, behavior });
      };
      const l = () => scroll(-1);
      const r = () => scroll(1);
      left?.addEventListener('click', l);
      right?.addEventListener('click', r);
      cleanups.push(() => {
        left?.removeEventListener('click', l);
        right?.removeEventListener('click', r);
      });
    }
    return () => cleanups.forEach((f) => f());
  }, [sliders]);
  return null;
}
