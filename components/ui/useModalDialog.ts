'use client';

import { useEffect, useRef } from 'react';

/**
 * Drives a native <dialog> as a modal: showModal() gives focus trapping, Escape handling and an
 * inert background for free. Clicking the backdrop closes it. Focus returns to the opener on close.
 */
export function useModalDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      opener.current = document.activeElement;
      dlg.showModal();
      document.documentElement.style.overflow = 'hidden';
    } else if (!open && dlg.open) {
      dlg.close();
    }
  }, [open]);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    const handleClose = () => {
      document.documentElement.style.overflow = '';
      onCloseRef.current();
      const el = opener.current as HTMLElement | null;
      if (el && typeof el.focus === 'function' && document.contains(el)) el.focus();
    };
    const handleClick = (e: MouseEvent) => {
      if (e.target === dlg) dlg.close(); // click on ::backdrop area
    };
    dlg.addEventListener('close', handleClose);
    dlg.addEventListener('click', handleClick);
    return () => {
      dlg.removeEventListener('close', handleClose);
      dlg.removeEventListener('click', handleClick);
    };
  }, []);

  return ref;
}
