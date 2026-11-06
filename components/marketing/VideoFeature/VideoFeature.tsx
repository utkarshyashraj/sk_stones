'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import styles from './VideoFeature.module.css';

const SOURCES = {
  desktop: '/media/quarry-to-finish-720.mp4', // 7.8 MB (was 60 MB)
  mobile: '/media/quarry-to-finish-540.mp4', // 2.9 MB
  poster: '/media/quarry-to-finish-poster.webp',
};

/**
 * Nothing is downloaded until the video scrolls into view (preload="none").
 * Desktop with motion allowed + no data-saver: autoplays muted, looping.
 * Mobile, reduced motion or data-saver: poster + play button (user-initiated download).
 */
export function VideoFeature({ title }: { title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<'idle' | 'auto' | 'manual' | 'playing'>('idle');

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const desktop = window.matchMedia('(min-width: 1025px)').matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection;
    const saveData = Boolean(conn?.saveData) || /2g/.test(conn?.effectiveType ?? '');
    const auto = desktop && !reduced && !saveData;
    setMode(auto ? 'auto' : 'manual');
    if (!auto) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          if (!video.src) video.src = SOURCES.desktop;
          video.play().catch(() => setMode('manual'));
        } else video.pause();
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  const playManually = () => {
    const video = ref.current;
    if (!video) return;
    if (!video.src)
      video.src = window.matchMedia('(min-width: 1025px)').matches ? SOURCES.desktop : SOURCES.mobile;
    video.controls = true;
    video.muted = true;
    video.play().catch(() => undefined);
    setMode('playing');
  };

  return (
    <div className={styles.frame}>
      <video
        ref={ref}
        className={styles.video}
        poster={SOURCES.poster}
        muted
        loop={mode === 'auto'}
        playsInline
        preload="none"
        width={1280}
        height={720}
        aria-label={title}
      />
      {mode === 'manual' ? (
        <button type="button" className={styles.play} onClick={playManually}>
          <span className={styles.playIcon} aria-hidden="true">
            <Icon name="play" size={22} />
          </span>
          <span>Play video: {title}</span>
        </button>
      ) : null}
    </div>
  );
}
