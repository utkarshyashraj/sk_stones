'use client';

import { dismissToast, useToast } from './toast-store';

/** Bottom toast with an optional action (Undo, View list); announced politely to screen readers. */
export function Toaster() {
  const t = useToast();
  return (
    <div className="sk-toast-region" role="status" aria-live="polite" aria-atomic="true">
      {t ? (
        <div className="sk-toast" key={t.id}>
          <span>{t.text}</span>
          {t.action ? (
            <button
              type="button"
              className="sk-toast-action"
              onClick={() => {
                t.action!.run();
                dismissToast();
              }}
            >
              {t.action.label}
            </button>
          ) : null}
          <button type="button" className="sk-toast-close" aria-label="Dismiss" onClick={dismissToast}>
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}
