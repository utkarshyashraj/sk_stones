'use client';

import { useEffect, useRef } from 'react';
import { withBase } from '@/lib/base-path';

const MOBILE = withBase('/media/quarry-to-finish-540.mp4');
const DESKTOP = withBase('/media/quarry-to-finish-720.mp4');
const POSTER = withBase('/media/quarry-to-finish-poster.webp');

/**
 * "Behind the Stone" video, as on the reference: muted loop that starts playing when it nears the
 * viewport; phones (and data-saver / 2G) get the smaller file, desktop the higher-quality one.
 * Nothing downloads before then (preload="none"); with reduced motion only the poster shows.
 */
export function HomeVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection;
    const full =
      window.matchMedia('(min-width: 1025px)').matches &&
      !(conn?.saveData || /2g/i.test(conn?.effectiveType ?? ''));
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        v.src = full ? DESKTOP : MOBILE;
        v.play().catch(() => {});
      },
      { threshold: 0.15, rootMargin: '120px 0px' },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      className="about-video"
      id="aboutVideo"
      muted
      loop
      playsInline
      preload="none"
      poster={POSTER}
      aria-label="From quarry to finish: how S K Stones India sources, cuts and prepares stone"
    />
  );
}
