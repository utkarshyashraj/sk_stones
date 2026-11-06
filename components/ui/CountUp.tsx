'use client';

import { useEffect, useRef } from 'react';

/**
 * Animated statistic. The real value is rendered in HTML (no-JS, SEO, screen readers); when the number
 * scrolls into view it counts up from 0 once. Skipped entirely for prefers-reduced-motion.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const m = value.match(/^([^\d]*)([\d,.]+)(.*)$/);
    if (!el || !m) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const [, prefix, num, suffix] = m;
    const target = Number(num!.replace(/,/g, ''));
    const decimals = (num!.split('.')[1] ?? '').length;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) return; // already visible on load: keep the final value
    el.textContent = `${prefix}0${suffix}`;
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1400);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = `${prefix}${(target * eased).toFixed(decimals)}${suffix}`;
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = value;
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
