import type { LightboxGroup } from '@/lib/lightbox-items';

/**
 * Publishes one grid's photos for the fullscreen viewer (loaded later with the feature bundle) as inline
 * JSON: data, not script, so it adds nothing to the page's JavaScript. `items` are in the grid's order.
 */
export function LightboxData(group: LightboxGroup) {
  return (
    <script
      type="application/json"
      data-sk-lightbox=""
      dangerouslySetInnerHTML={{ __html: JSON.stringify(group).replace(/</g, '\u003c') }}
    />
  );
}
