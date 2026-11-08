/**
 * Analytics hook. No provider is installed: `track` does nothing unless NEXT_PUBLIC_ANALYTICS is set at build
 * time, and then only hands the event to `window.skAnalytics` (or pushes it to `window.dataLayer`), whichever
 * the chosen provider's snippet defines. Never sends personal data; search queries are the only free text.
 */
export type AnalyticsEvent =
  | 'search_used'
  | 'search_no_results'
  | 'filter_used'
  | 'stone_saved'
  | 'stone_unsaved'
  | 'list_sent'
  | 'calculator_used'
  | 'guide_completed';

type Props = Record<string, string | number | boolean | undefined>;
declare global {
  interface Window {
    skAnalytics?: (event: AnalyticsEvent, props: Props) => void;
    dataLayer?: unknown[];
  }
}

export const ANALYTICS_ENABLED = Boolean(process.env.NEXT_PUBLIC_ANALYTICS);

export function track(event: AnalyticsEvent, props: Props = {}): void {
  if (!ANALYTICS_ENABLED || typeof window === 'undefined') return;
  try {
    if (window.skAnalytics) window.skAnalytics(event, props);
    else (window.dataLayer ??= []).push({ event, ...props });
  } catch {
    // analytics must never break the page
  }
}
