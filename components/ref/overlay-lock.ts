/**
 * Shared scroll lock for every overlay (bottom-bar sheets, lightbox, search, saved list, dialogs): the page
 * behind stops scrolling, and the page wrapper carries data-sk-overlay while any is open, so floating
 * elements (the "Saved" pill) can hide themselves in CSS. Counted, so nested overlays unlock correctly.
 */
let count = 0;
let saved = '';

export function lockOverlay(): () => void {
  const html = document.documentElement;
  if (count === 0) {
    saved = html.style.overflow;
    html.style.overflow = 'hidden';
  }
  count++;
  document.querySelector('[data-ref-root]')?.setAttribute('data-sk-overlay', '');
  let released = false;
  return () => {
    if (released) return;
    released = true;
    count = Math.max(0, count - 1);
    if (count === 0) {
      html.style.overflow = saved;
      document.querySelector('[data-ref-root]')?.removeAttribute('data-sk-overlay');
    }
  };
}
