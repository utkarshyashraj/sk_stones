'use client';

import { useSyncExternalStore } from 'react';

/** One toast at a time (newest wins), with an optional action such as Undo or View list. */
export interface Toast {
  id: number;
  text: string;
  action?: { label: string; run: () => void };
  /** ms before it hides itself; actions get longer */
  ttl: number;
}
let current: Toast | null = null;
let seq = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function showToast(text: string, action?: Toast['action']) {
  if (timer) clearTimeout(timer);
  const t: Toast = { id: ++seq, text, action, ttl: action ? 6000 : 3500 };
  current = t;
  emit();
  timer = setTimeout(() => {
    if (current?.id === t.id) {
      current = null;
      emit();
    }
  }, t.ttl);
}
export function dismissToast() {
  current = null;
  emit();
}
export function useToast(): Toast | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => null,
  );
}
