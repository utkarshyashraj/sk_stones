'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LightboxGroup, LightboxItem } from '@/lib/lightbox-items';
import { LightboxView } from './LightboxView';
import { StonePanel } from './StonePanel';

interface OpenState {
  group: number;
  /** indexes (into the group's items) of the grid items visible when it opened — filters hide the rest */
  list: number[];
  pos: number;
}

const readGroups = (): LightboxGroup[] =>
  [...document.querySelectorAll<HTMLScriptElement>('script[data-sk-lightbox]')].flatMap((s) => {
    try {
      return [JSON.parse(s.textContent || '') as LightboxGroup];
    } catch {
      return [];
    }
  });
const itemEls = (g: LightboxGroup) => [...document.querySelectorAll<HTMLElement>(`${g.grid} ${g.item}`)];
const visible = (el: HTMLElement) => !el.hidden && !el.closest('[hidden]');
export const DEEP_LINK = /^#(?:stone|product)=([\w-]+)/;

/** Up to six other stones from the same collection, starting with the ones after this stone (wrapping). */
export function relatedTo(items: LightboxItem[], item: LightboxItem, max = 6): LightboxItem[] {
  const at = items.indexOf(item);
  const ordered = [...items.slice(at + 1), ...items.slice(0, Math.max(at, 0))];
  return ordered.filter((it) => it.id && it.c === item.c && it.id !== item.id).slice(0, max);
}

/**
 * Opens the fullscreen viewer from any grid published with <LightboxData>: a click anywhere on an item
 * (except its Save button), or Enter/Space on its focusable part. Steps only through items currently
 * visible (filters hide the rest). Product grids keep the address in step (#stone=<id>); both #stone= and
 * the pre-port #product= open the viewer on load or when the hash changes.
 */
export function LightboxController() {
  const [groups, setGroups] = useState<LightboxGroup[]>([]);
  // Event handlers read the latest grids from here (a click replayed right after mount can arrive before
  // the first re-render); when still empty they read the DOM directly.
  const groupsRef = useRef<LightboxGroup[]>([]);
  const current = useCallback(() => {
    if (!groupsRef.current.length) groupsRef.current = readGroups();
    return groupsRef.current;
  }, []);
  useEffect(() => {
    groupsRef.current = groups;
  }, [groups]);
  // Read the page's grids once it is in the DOM (after a client-side navigation this component can render
  // before the new page has committed), and again whenever a client-rendered grid (search results) asks.
  useEffect(() => {
    const read = () => setGroups(readGroups());
    queueMicrotask(read);
    window.addEventListener('sk:lightbox-refresh', read);
    return () => window.removeEventListener('sk:lightbox-refresh', read);
  }, []);
  const [open, setOpen] = useState<OpenState | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const openAt = useCallback(
    (gi: number, idx: number, from?: HTMLElement) => {
      const all = current();
      if (all !== groups) setGroups(all);
      const g = all[gi];
      if (!g) return;
      const els = itemEls(g);
      let list = els.map((el, i) => (visible(el) ? i : -1)).filter((i) => i >= 0 && i < g.items.length);
      if (!list.includes(idx)) list = g.items.map((_, i) => i); // a deep link to a filtered-out stone
      opener.current = from ?? els.at(idx) ?? null;
      setOpen({ group: gi, list, pos: list.indexOf(idx) });
    },
    [groups, current],
  );

  // Delegated opening from the server-rendered grids.
  useEffect(() => {
    const find = (target: EventTarget | null) => {
      const t = target as Element | null;
      if (!t?.closest || t.closest('[data-save-id], a, button:not([data-sk-click])')) return null;
      const all = current();
      for (let gi = 0; gi < all.length; gi++) {
        const g = all[gi]!;
        const el = t.closest<HTMLElement>(`${g.grid} ${g.item}`);
        if (el) return { gi, idx: itemEls(g).indexOf(el), el };
      }
      return null;
    };
    const onClick = (e: MouseEvent) => {
      const hit = find(e.target);
      if (!hit || hit.idx < 0) return;
      e.preventDefault();
      openAt(hit.gi, hit.idx, (e.target as Element).closest<HTMLElement>('[data-sk-click]') ?? hit.el);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (!(e.target as Element)?.matches?.('[data-sk-click]')) return;
      const hit = find(e.target);
      if (!hit || hit.idx < 0) return;
      e.preventDefault();
      openAt(hit.gi, hit.idx, e.target as HTMLElement);
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [current, openAt]);

  // Deep links: #stone=<id> (new) and #product=<id> (pre-port links).
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.match(DEEP_LINK)?.[1];
      if (!id) return;
      for (let gi = 0; gi < groups.length; gi++) {
        const idx = groups[gi]!.items.findIndex((it) => it.id === id);
        if (idx >= 0) {
          window.dispatchEvent(new CustomEvent('sk:reveal', { detail: { id } })); // filters let it show
          openAt(gi, idx);
          return;
        }
      }
    };
    const raf = requestAnimationFrame(fromHash);
    window.addEventListener('hashchange', fromHash);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('hashchange', fromHash);
    };
  }, [groups, openAt]);

  const group = open ? groups[open.group] : undefined;
  const item: LightboxItem | undefined = open && group ? group.items[open.list[open.pos]!] : undefined;

  // Keep the address in step for product photos, so the open stone can be shared.
  useEffect(() => {
    if (!item?.id) return;
    const base = window.location.pathname + window.location.search;
    history.replaceState(history.state, '', `${base}#stone=${item.id}`);
  }, [item?.id]);

  const close = useCallback(() => {
    setOpen(null);
    if (DEEP_LINK.test(window.location.hash))
      history.replaceState(history.state, '', window.location.pathname + window.location.search);
    const el = opener.current;
    const target = el?.matches('[data-sk-click]')
      ? el
      : (el?.querySelector<HTMLElement>('[data-sk-click]') ?? el);
    requestAnimationFrame(() => target?.focus());
  }, []);
  const step = useCallback(
    (d: number) => setOpen((o) => (o ? { ...o, pos: (o.pos + d + o.list.length) % o.list.length } : o)),
    [],
  );
  const jump = useCallback(
    (id: string) =>
      setOpen((o) => {
        if (!o || !group) return o;
        const idx = group.items.findIndex((it) => it.id === id);
        if (idx < 0) return o;
        const list = o.list.includes(idx) ? o.list : [...o.list, idx];
        return { ...o, list, pos: list.indexOf(idx) };
      }),
    [group],
  );

  if (!open || !group || !item) return null;
  return (
    <LightboxView
      entries={open.list.map((i) => group.items[i]!)}
      index={open.pos}
      onStep={step}
      onClose={close}
      className={item.id ? 'sk-lightbox--stone' : ''}
      panel={
        <StonePanel
          item={item}
          pos={open.pos}
          total={open.list.length}
          related={relatedTo(group.items, item)}
          onJump={jump}
        />
      }
    />
  );
}
