'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { lockOverlay } from '../overlay-lock';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal behaviour for the feature dialogs: locks page scroll, moves focus inside (the element marked
 * [data-autofocus], else the first control), keeps Tab inside, closes on Escape, and returns focus to
 * whatever had it before. With `backCloses`, the phone back button closes it (one history entry while open).
 */
export function useDialog(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
  { backCloses = false }: { backCloses?: boolean } = {},
) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const unlock = lockOverlay();
    const el = ref.current;
    const first =
      el?.querySelector<HTMLElement>('[data-autofocus]') ?? el?.querySelector<HTMLElement>(FOCUSABLE);
    const t = window.setTimeout(() => first?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close.current();
      } else if (e.key === 'Tab' && el) {
        const items = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((x) => x.offsetParent !== null);
        if (!items.length) return;
        const i = items.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey ? i <= 0 : i === items.length - 1) {
          e.preventDefault();
          items.at(e.shiftKey ? -1 : 0)?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey, true);
    let poppedByUs = false;
    const onPop = () => {
      poppedByUs = true;
      close.current();
    };
    if (backCloses) {
      history.pushState({ skDialog: true }, '');
      window.addEventListener('popstate', onPop);
    }
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey, true);
      unlock();
      if (backCloses) {
        window.removeEventListener('popstate', onPop);
        if (!poppedByUs && history.state?.skDialog) history.back();
      }
      if (opener?.isConnected) opener.focus();
    };
  }, [open, ref, backCloses]);
}
