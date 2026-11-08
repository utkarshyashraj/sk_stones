'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { lockOverlay } from '../overlay-lock';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// One history entry per open "back closes it" dialog. Closing from the page undoes that entry with
// history.back(), which completes asynchronously; a dialog opened before it has completed waits for it,
// so the late "back" never pops the new dialog's entry.
let backPending: Promise<void> | null = null;
function undoEntry() {
  backPending = new Promise((resolve) => {
    const done = () => {
      window.removeEventListener('popstate', done);
      window.clearTimeout(timer);
      backPending = null;
      resolve();
    };
    const timer = window.setTimeout(done, 600);
    window.addEventListener('popstate', done);
    history.back();
  });
}

/**
 * Modal behaviour for the feature dialogs: locks page scroll, moves focus inside (the element marked
 * [data-autofocus], else the first control), keeps Tab inside, closes on Escape, and returns focus to
 * whatever had it before. With `backCloses`, the phone back button closes it (one history entry while open).
 * Returns `leaveVia()`: call it before closing to navigate somewhere, so that history entry is replaced by
 * the destination (router.replace) instead of being undone.
 */
export function useDialog(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
  { backCloses = false }: { backCloses?: boolean } = {},
) {
  const close = useRef(onClose);
  const navigating = useRef(false);
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

    let cancelled = false;
    let armed = false;
    let poppedByUs = false;
    const onPop = () => {
      poppedByUs = true;
      close.current();
    };
    const arm = () => {
      if (cancelled) return;
      history.pushState({ ...history.state, skDialog: true }, '');
      window.addEventListener('popstate', onPop);
      armed = true;
    };
    if (backCloses) {
      if (backPending) void backPending.then(arm);
      else arm();
    }
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey, true);
      unlock();
      if (armed) {
        window.removeEventListener('popstate', onPop);
        if (!poppedByUs && !navigating.current && history.state?.skDialog) undoEntry();
      }
      if (opener?.isConnected && !navigating.current) opener.focus();
    };
  }, [open, ref, backCloses]);
  return {
    leaveVia: () => {
      navigating.current = true;
    },
  };
}
