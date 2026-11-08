/**
 * Tiny bridge between always-loaded UI (header icons, bottom-bar sheets, server-rendered buttons) and the
 * lazily loaded feature bundle. `openFeature` works before the bundle has loaded: FeatureBoot queues the
 * request, loads the bundle and FeatureRoot replays it.
 */
export type FeatureName = 'search' | 'saved' | 'calculator' | 'guide';
export interface FeatureRequest {
  name: FeatureName;
  /** e.g. a prefilled search query, or where the calculator result goes */
  detail?: Record<string, string>;
}
export const FEATURE_EVENT = 'sk:feature';

export function openFeature(name: FeatureName, detail?: Record<string, string>) {
  window.dispatchEvent(new CustomEvent<FeatureRequest>(FEATURE_EVENT, { detail: { name, detail } }));
}
