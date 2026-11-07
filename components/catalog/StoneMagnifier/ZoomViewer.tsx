'use client';

import { useCallback, useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/ui/Icon';
import { useModalDialog } from '@/components/ui/useModalDialog';
import { pickWidth, imageUrl } from '@/lib/image-url';
import type { ImageRef } from '@/lib/types';
import styles from './ZoomViewer.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  image: ImageRef;
  zoomSrc: string;
  alt: string;
}

const MAX = 4;
const TOGGLE = 2.5;
const DOUBLE_TAP_MS = 300;
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/**
 * Fullscreen viewer: pinch / wheel zoom up to 4×, drag to pan, double-tap (or double-click) toggles
 * 1× ↔ 2.5×. A native modal <dialog> traps focus, closes on Escape and returns focus to the opener.
 * Portalled to <body> so its touches never reach the lightbox's swipe-to-navigate handler.
 * Gestures write the transform straight to the DOM (refs + rAF), no React state per frame.
 */
export function ZoomViewer({ open, onClose, image, zoomSrc, alt }: Props) {
  const ref = useModalDialog(open, onClose);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const view = useRef({ s: 1, tx: 0, ty: 0 });
  const base = useRef({ w: 0, h: 0 }); // fitted size at 1×
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ s: number; tx: number; ty: number; ux: number; uy: number; d: number } | null>(
    null,
  );
  const tap = useRef<{ t: number; x: number; y: number; moved: boolean; downX: number; downY: number }>({
    t: 0,
    x: 0,
    y: 0,
    moved: false,
    downX: 0,
    downY: 0,
  });
  const raf = useRef(0);

  const render = useCallback((animate = false) => {
    const img = imgRef.current;
    if (!img) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    img.style.transition = animate && !reduce ? 'transform 200ms ease-out' : 'none';
    const { s, tx, ty } = view.current;
    img.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;
    img.style.cursor = s > 1.01 ? 'grab' : 'zoom-in';
  }, []);

  const schedule = useCallback(() => {
    if (!raf.current)
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        render();
      });
  }, [render]);

  /** Keep the image covering the stage once it is bigger than it (no panning into empty space). */
  const bound = useCallback((s: number, tx: number, ty: number) => {
    const stage = stageRef.current;
    if (!stage) return { s, tx, ty };
    const mx = Math.max(0, (base.current.w * s - stage.clientWidth) / 2);
    const my = Math.max(0, (base.current.h * s - stage.clientHeight) / 2);
    return { s, tx: clamp(tx, -mx, mx), ty: clamp(ty, -my, my) };
  }, []);

  /** Zoom to `s` keeping the stage point (cx, cy) (offset from the stage centre) fixed under the finger. */
  const zoomAt = useCallback(
    (next: number, cx: number, cy: number, animate: boolean) => {
      const { s, tx, ty } = view.current;
      const s2 = clamp(next, 1, MAX);
      const k = s2 / s;
      view.current = bound(s2, cx - k * (cx - tx), cy - k * (cy - ty));
      if (animate) render(true);
      else schedule();
    },
    [bound, render, schedule],
  );

  const fit = useCallback(() => {
    const stage = stageRef.current;
    const img = imgRef.current;
    if (!stage || !img) return;
    const k = Math.min(stage.clientWidth / image.w, stage.clientHeight / image.h);
    base.current = { w: image.w * k, h: image.h * k };
    img.style.width = `${base.current.w}px`;
    img.style.height = `${base.current.h}px`;
    view.current = bound(view.current.s, view.current.tx, view.current.ty);
    render();
  }, [bound, image.h, image.w, render]);

  // Each opening: reset to 1×, fit to the screen, then swap in the high-res file once it has loaded.
  useEffect(() => {
    if (!open) return;
    view.current = { s: 1, tx: 0, ty: 0 };
    fit();
    const hi = new window.Image();
    hi.onload = () => {
      if (imgRef.current) imgRef.current.src = zoomSrc;
    };
    hi.src = zoomSrc;
    window.addEventListener('resize', fit);
    return () => {
      hi.onload = null;
      window.removeEventListener('resize', fit);
    };
  }, [open, fit, zoomSrc]);

  // Wheel zoom (non-passive so the page behind never scrolls).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = stage.getBoundingClientRect();
      zoomAt(
        view.current.s * Math.exp(-e.deltaY * 0.002),
        e.clientX - r.left - r.width / 2,
        e.clientY - r.top - r.height / 2,
        false,
      );
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const local = (x: number, y: number) => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: x - r.left - r.width / 2, y: y - r.top - r.height / 2 };
  };

  /** Snapshot the gesture: the image point under the finger(s) stays there as they move. */
  const startGesture = () => {
    const pts = [...pointers.current.values()];
    const mid = local(
      pts.reduce((a, p) => a + p.x, 0) / pts.length,
      pts.reduce((a, p) => a + p.y, 0) / pts.length,
    );
    const { s, tx, ty } = view.current;
    const d = pts.length > 1 ? Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y) : 0;
    gesture.current = { s, tx, ty, ux: (mid.x - tx) / s, uy: (mid.y - ty) / s, d };
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1)
      tap.current = { ...tap.current, moved: false, downX: e.clientX, downY: e.clientY };
    else tap.current.moved = true; // a pinch is never a tap
    startGesture();
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (Math.hypot(e.clientX - tap.current.downX, e.clientY - tap.current.downY) > 8)
      tap.current.moved = true;
    const g = gesture.current;
    if (!g) return;
    const pts = [...pointers.current.values()];
    const mid = local(
      pts.reduce((a, p) => a + p.x, 0) / pts.length,
      pts.reduce((a, p) => a + p.y, 0) / pts.length,
    );
    let s = g.s;
    if (pts.length > 1 && g.d > 0)
      s = clamp((g.s * Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y)) / g.d, 1, MAX);
    else if (g.s <= 1.01) return; // at 1× a one-finger drag does nothing
    view.current = bound(s, mid.x - s * g.ux, mid.y - s * g.uy);
    schedule();
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(e.pointerId)) return;
    if (pointers.current.size) return startGesture(); // one finger lifted mid-pinch: keep panning
    gesture.current = null;
    const t = tap.current;
    if (t.moved || e.type === 'pointercancel') return;
    const now = performance.now();
    if (now - t.t < DOUBLE_TAP_MS && Math.hypot(e.clientX - t.x, e.clientY - t.y) < 30) {
      const p = local(e.clientX, e.clientY);
      if (view.current.s > 1.01) {
        view.current = { s: 1, tx: 0, ty: 0 };
        render(true);
      } else zoomAt(TOGGLE, p.x, p.y, true);
      tap.current.t = 0;
    } else tap.current = { ...t, t: now, x: e.clientX, y: e.clientY };
  };

  const step = (factor: number) => zoomAt(view.current.s * factor, 0, 0, true);

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    const pan = 80;
    const { s, tx, ty } = view.current;
    const keys: Record<string, () => void> = {
      '+': () => step(1.5),
      '=': () => step(1.5),
      '-': () => step(1 / 1.5),
      '0': () => {
        view.current = { s: 1, tx: 0, ty: 0 };
        render(true);
      },
      ArrowLeft: () => ((view.current = bound(s, tx + pan, ty)), render(true)),
      ArrowRight: () => ((view.current = bound(s, tx - pan, ty)), render(true)),
      ArrowUp: () => ((view.current = bound(s, tx, ty + pan)), render(true)),
      ArrowDown: () => ((view.current = bound(s, tx, ty - pan)), render(true)),
    };
    const fn = keys[e.key];
    if (!fn) return;
    e.preventDefault();
    e.stopPropagation(); // arrows pan here; they must not change the stone in the lightbox behind
    fn();
  };

  // First paint: the on-screen size (already cached by the lightbox); the high-res file replaces it.
  const firstSrc = imageUrl(image.key, pickWidth(image, 1200));

  return createPortal(
    <dialog ref={ref} className={styles.viewer} aria-label={`${alt} — zoomed view`} onKeyDown={onKeyDown}>
      <button
        type="button"
        className={styles.close}
        onClick={() => ref.current?.close()}
        aria-label="Close zoomed view"
      >
        <Icon name="close" size={22} />
      </button>
      <div
        ref={stageRef}
        className={styles.stage}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- transformed in place; next/image adds nothing here */}
        <img ref={imgRef} src={firstSrc} alt={alt} className={styles.img} draggable={false} />
      </div>
      <div className={styles.tools}>
        <button type="button" className={styles.tool} onClick={() => step(1 / 1.5)} aria-label="Zoom out">
          <Icon name="zoom-out" size={20} />
        </button>
        <p className={styles.help} aria-hidden="true">
          <span className={styles.helpTouch}>Pinch or double-tap to zoom</span>
          <span className={styles.helpMouse}>Scroll or double-click to zoom · drag to pan</span>
        </p>
        <button type="button" className={styles.tool} onClick={() => step(1.5)} aria-label="Zoom in">
          <Icon name="zoom-in" size={20} />
        </button>
      </div>
    </dialog>,
    document.body,
  );
}
