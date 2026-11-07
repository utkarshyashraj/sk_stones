'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Picture } from '@/components/ui/Picture';
import { imageUrl } from '@/lib/image-url';
import type { ImageRef } from '@/lib/types';
import { ZoomViewer } from './ZoomViewer';
import styles from './StoneMagnifier.module.css';

interface Props {
  image: ImageRef;
  /** Descriptive: stone name + finish. */
  alt: string;
  /** Layout hint for the base image's srcset. */
  sizes: string;
  /** High-res image for the lens and the fullscreen viewer. Defaults to the catalogue's zoom rendition. */
  zoomSrc?: string;
  /** Starting magnification, 2–4 (the mouse wheel changes it within that range). */
  zoom?: number;
  /** Lens diameter in px. Defaults to 180 for mouse/pen and 140 for touch. */
  lensSize?: number;
  /**
   * Fill the (positioned) parent: every photo gets the same frame, cover-cropped and centred, and
   * the lens maths compensates for the crop. Omit to show the photo uncropped at its own ratio.
   */
  fill?: boolean;
  className?: string;
}

const HINT_KEY = 'sk-magnifier-used';
const LONG_PRESS_MS = 300;
const TAP_SLOP = 10; // px a finger may drift and still count as a tap / long-press
const MIN_ZOOM = 2;
const MAX_ZOOM = 4;
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/** The magnifier rendition when one exists, else the largest srcset file (already full resolution). */
export const zoomSrcOf = (img: ImageRef) => imageUrl(img.key, img.zoom ?? img.widths.at(-1) ?? 1200);

function hintSeen() {
  try {
    return localStorage.getItem(HINT_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Stone image with an inspection lens.
 * Mouse/pen: a circular lens follows the cursor; the wheel changes magnification (2–4×).
 * Touch: swipes scroll as usual; a ~300 ms press shows the lens above the finger; a tap opens the
 * fullscreen pinch-zoom viewer. The "Zoom image" button opens the same viewer for keyboard users.
 *
 * Without `fill` the box takes the image's own aspect ratio (no crop). With `fill` the photo is
 * cover-cropped and the lens maps through the rendered crop offset, so it still shows exactly the
 * spot under the cursor. The fullscreen viewer always shows the whole photo. Pointer moves touch only refs and the DOM (one rAF write per frame), never React state.
 */
export function StoneMagnifier({
  image,
  alt,
  sizes,
  zoomSrc: zoomSrcProp,
  zoom = 2.5,
  lensSize,
  fill,
  className,
}: Props) {
  const zoomSrc = zoomSrcProp ?? zoomSrcOf(image);
  const boxRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const point = useRef({ x: 0, y: 0, touch: false });
  const zoomLevel = useRef(clamp(zoom, MIN_ZOOM, MAX_ZOOM));
  const lensPx = useRef(180);
  const mode = useRef<'off' | 'mouse' | 'touch'>('off');
  const hiRes = useRef<'idle' | 'loading' | 'done'>('idle');
  const press = useRef<{ id: number; x: number; y: number; timer: number } | null>(null);
  const [hint, setHint] = useState(() => !hintSeen());
  const [viewer, setViewer] = useState<'closed' | 'open' | 'shut'>('closed'); // 'shut' keeps it mounted

  const draw = useCallback(() => {
    raf.current = 0;
    const box = boxRef.current;
    const lens = lensRef.current;
    if (!box || !lens || mode.current === 'off') return;
    const r = box.getBoundingClientRect();
    const L = lensPx.current;
    const z = zoomLevel.current;
    const p = point.current;
    // The point being inspected, clamped to the visible box.
    const x = clamp(p.x - r.left, 0, r.width);
    const y = clamp(p.y - r.top, 0, r.height);
    // Rendered photo under object-fit: cover (equals the box when there is no frame) and its offset.
    const k = Math.max(r.width / image.w, r.height / image.h);
    const rw = image.w * k;
    const rh = image.h * k;
    const ox = (r.width - rw) / 2;
    const oy = (r.height - rh) / 2;
    // Lens centred on the cursor. For a finger it sits above it, or beside it when there is no room
    // above (short images on phones), so it is never covered. Always kept inside the image.
    const GAP = 24;
    let cx = x - L / 2;
    let cy = y - L / 2;
    if (p.touch) {
      if (y - L - GAP >= 0) cy = y - L - GAP;
      else cx = x + GAP + L <= r.width ? x + GAP : x - GAP - L;
    }
    const lx = clamp(cx, 0, Math.max(0, r.width - L));
    const ly = clamp(cy, 0, Math.max(0, r.height - L));
    lens.style.transform = `translate3d(${lx}px, ${ly}px, 0)`;
    lens.style.backgroundSize = `${rw * z}px ${rh * z}px`;
    // The inspected point always sits at the lens centre, wherever the lens itself is clamped to.
    lens.style.backgroundPosition = `${L / 2 - (x - ox) * z}px ${L / 2 - (y - oy) * z}px`;
  }, [image.w, image.h]);

  const schedule = useCallback(
    (clientX: number, clientY: number, touch: boolean) => {
      point.current = { x: clientX, y: clientY, touch };
      if (!raf.current) raf.current = requestAnimationFrame(draw);
    },
    [draw],
  );

  /** Fetch the high-res file on first interaction only; the lens shows the on-screen image until then. */
  const preload = useCallback(() => {
    if (hiRes.current !== 'idle') return;
    hiRes.current = 'loading';
    const img = new window.Image();
    img.decoding = 'async';
    img.onload = () => {
      hiRes.current = 'done';
      if (lensRef.current) lensRef.current.style.backgroundImage = `url("${zoomSrc}")`;
    };
    img.onerror = () => {
      hiRes.current = 'idle';
    };
    img.src = zoomSrc;
  }, [zoomSrc]);

  const show = useCallback(
    (kind: 'mouse' | 'touch', clientX: number, clientY: number) => {
      const lens = lensRef.current;
      const base = boxRef.current?.querySelector('img');
      if (!lens) return;
      mode.current = kind;
      lensPx.current = lensSize ?? (kind === 'touch' ? 140 : 180);
      lens.style.width = lens.style.height = `${lensPx.current}px`;
      if (hiRes.current !== 'done' && base)
        lens.style.backgroundImage = `url("${base.currentSrc || base.src}")`;
      schedule(clientX, clientY, kind === 'touch');
      lens.dataset.on = '';
    },
    [lensSize, schedule],
  );

  /** First real use (cursor moved over the image, or a long-press) retires the hint for good. */
  const dismissHint = () => {
    if (!hint) return;
    setHint(false);
    try {
      localStorage.setItem(HINT_KEY, '1');
    } catch {
      /* storage unavailable: the hint simply returns next visit */
    }
  };

  const hide = useCallback(() => {
    mode.current = 'off';
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = 0;
    if (lensRef.current) delete lensRef.current.dataset.on;
  }, []);

  const cancelPress = useCallback(() => {
    if (press.current) window.clearTimeout(press.current.timer);
    press.current = null;
  }, []);

  // Native listeners: these must be non-passive to stop the page scrolling only while the lens is up.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const onWheel = (e: WheelEvent) => {
      if (mode.current !== 'mouse') return;
      e.preventDefault();
      zoomLevel.current = clamp(zoomLevel.current * Math.exp(-e.deltaY * 0.0015), MIN_ZOOM, MAX_ZOOM);
      if (!raf.current) raf.current = requestAnimationFrame(draw);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (mode.current === 'touch') e.preventDefault();
    };
    const onContextMenu = (e: Event) => {
      if (mode.current === 'touch' || press.current) e.preventDefault(); // long-press, not "save image"
    };
    box.addEventListener('wheel', onWheel, { passive: false });
    box.addEventListener('touchmove', onTouchMove, { passive: false });
    box.addEventListener('contextmenu', onContextMenu);
    return () => {
      box.removeEventListener('wheel', onWheel);
      box.removeEventListener('touchmove', onTouchMove);
      box.removeEventListener('contextmenu', onContextMenu);
    };
  }, [draw]);

  useEffect(
    () => () => {
      cancelPress();
      if (raf.current) cancelAnimationFrame(raf.current);
    },
    [cancelPress],
  );

  const onPointerEnter = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    preload();
    show('mouse', e.clientX, e.clientY);
  };

  const onPointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'touch') hide();
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'touch' || !e.isPrimary) return;
    const box = e.currentTarget;
    delete box.dataset.lensUsed; // a new gesture: swipe navigation is allowed again
    preload();
    cancelPress();
    const { pointerId: id, clientX: x, clientY: y } = e;
    const timer = window.setTimeout(() => {
      press.current = null;
      box.dataset.lensUsed = ''; // tells the lightbox not to treat this drag as a swipe
      try {
        box.setPointerCapture(id);
      } catch {
        /* pointer already gone */
      }
      show('touch', point.current.x || x, point.current.y || y);
      dismissHint();
    }, LONG_PRESS_MS);
    press.current = { id, x, y, timer };
    point.current = { x, y, touch: true };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'touch') {
      if (mode.current !== 'mouse') return;
      schedule(e.clientX, e.clientY, false);
      dismissHint(); // not on enter: a lightbox opening under a resting cursor is not a use
      return;
    }
    if (mode.current === 'touch') return schedule(e.clientX, e.clientY, true);
    const p = press.current;
    if (!p || p.id !== e.pointerId) return;
    point.current = { x: e.clientX, y: e.clientY, touch: true };
    if (Math.hypot(e.clientX - p.x, e.clientY - p.y) > TAP_SLOP) cancelPress(); // it's a scroll
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'touch') return;
    if (mode.current === 'touch') return hide();
    if (press.current?.id === e.pointerId) {
      cancelPress();
      setViewer('open'); // a tap
    }
  };

  const onPointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'touch') return;
    cancelPress();
    if (mode.current === 'touch') hide();
  };

  const style = fill
    ? undefined
    : ({ '--mag-ar': `${image.w} / ${image.h}`, '--mag-ratio': image.w / image.h } as CSSProperties);

  return (
    <div className={`${styles.root} ${fill ? styles.fill : ''} ${className ?? ''}`} style={style}>
      <div
        ref={boxRef}
        className={styles.box}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <Picture
          image={image}
          alt={alt}
          sizes={sizes}
          priority
          preloadHint={false}
          imgClassName={styles.img}
        />
        <div ref={lensRef} className={styles.lens} aria-hidden="true" />
      </div>
      {hint ? (
        <p className={styles.hint} aria-hidden="true">
          <Icon name="search" size={14} />
          <span className={styles.hintHover}>Hover to inspect the stone</span>
          <span className={styles.hintTouch}>Hold to inspect · tap to enlarge</span>
        </p>
      ) : null}
      <button
        type="button"
        className={styles.zoomBtn}
        aria-label="Zoom image"
        onClick={() => setViewer('open')}
      >
        <Icon name="zoom-in" size={20} />
      </button>
      {viewer !== 'closed' ? (
        <ZoomViewer
          open={viewer === 'open'}
          onClose={() => setViewer('shut')}
          image={image}
          zoomSrc={zoomSrc}
          alt={alt}
        />
      ) : null}
    </div>
  );
}
