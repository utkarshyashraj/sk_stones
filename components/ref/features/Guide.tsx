'use client';

import { useRouter } from 'next/navigation';
import { useId, useMemo, useRef, useState } from 'react';
import { track } from '@/lib/analytics';
import { fromIndexStones } from '@/lib/filter-stones';
import { facetDef } from '@/lib/filters';
import { guideResult, guideSteps, STEP_FACET, whereOptions, type Answers, type StepKey } from '@/lib/guide';
import { Icon } from './Icon';
import { loadIndex, useIndex } from './index-client';
import { useDialog } from './useDialog';

const QUESTION: Record<StepKey, string> = {
  where: 'Where will the stone go?',
  colour: 'What look do you like?',
  origin: 'Indian or imported?',
};

/**
 * "Help me choose": a dialog (full screen on phones) that asks where the stone goes and — once the data
 * covers them — the colour and Indian vs imported, then opens /search with those filters. If nothing
 * matches, the last step is dropped and the results page says so. Tracks guide_completed.
 */
export function Guide({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { leaveVia } = useDialog(ref, true, onClose, { backCloses: true });
  const router = useRouter();
  const uid = useId();
  const { index, error } = useIndex();
  const stones = useMemo(() => (index ? fromIndexStones(index, index.stones) : []), [index]);
  const steps = useMemo(
    () => (index ? guideSteps(index.coverage.fields, index.coverage.threshold) : (['where'] as StepKey[])),
    [index],
  );
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const key = steps[step]!;

  const options = (k: StepKey): { value: string; label: string }[] => {
    if (k === 'where') return whereOptions(stones).map((w) => ({ value: w.key, label: w.label }));
    const f = facetDef(STEP_FACET[k]);
    return [...new Set(stones.flatMap(f.values))].sort().map((v) => ({ value: v, label: v }));
  };

  const finish = (a: Answers) => {
    const r = guideResult(stones, a, steps);
    track('guide_completed', {
      where: a.where?.join(',') ?? '',
      steps: steps.length,
      results: r.count,
      broadened: r.dropped.join(','),
    });
    const place = whereOptions(stones).find((w) => a.where?.includes(w.key))?.label;
    leaveVia();
    router.replace(`/search?${r.query}${place ? `&for=${encodeURIComponent(place)}` : ''}`);
    onClose();
  };
  const answer = (value: string | null) => {
    const a = { ...answers, [key]: value ? [value] : undefined };
    setAnswers(a);
    if (step + 1 < steps.length) setStep(step + 1);
    else finish(a);
  };

  return (
    <>
      <div className="sk-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        className="sk-panel sk-panel--guide"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
      >
        <div className="sk-panel-head">
          <h2 id={`${uid}-title`}>Help me choose</h2>
          <button type="button" className="sk-icon-btn" aria-label="Close" onClick={onClose}>
            <Icon name="times" />
          </button>
        </div>
        <div className="sk-panel-body sk-guide">
          {error && !index ? (
            <div className="sk-empty">
              <p>We couldn&apos;t load our stones just now.</p>
              <button
                type="button"
                className="sk-btn sk-btn--gold"
                onClick={() => void loadIndex().catch(() => {})}
              >
                Try again
              </button>
            </div>
          ) : !index ? (
            <p className="sk-muted" aria-busy="true">
              Loading…
            </p>
          ) : (
            <fieldset key={key}>
              <legend>
                {steps.length > 1 ? (
                  <span className="sk-guide-step">
                    Step {step + 1} of {steps.length}
                  </span>
                ) : null}
                <span className="sk-guide-q">{QUESTION[key]}</span>
              </legend>
              <div className="sk-guide-options">
                {options(key).map((o, i) => (
                  <button
                    key={o.value}
                    type="button"
                    className="sk-guide-option"
                    aria-pressed={answers[key]?.includes(o.value) ?? false}
                    data-autofocus={i === 0 ? '' : undefined}
                    onClick={() => answer(o.value)}
                  >
                    {o.label}
                  </button>
                ))}
                {key !== 'where' ? (
                  <button type="button" className="sk-guide-option sk-guide-any" onClick={() => answer(null)}>
                    No preference
                  </button>
                ) : null}
              </div>
            </fieldset>
          )}
        </div>
        {step > 0 ? (
          <div className="sk-panel-foot sk-guide-foot">
            <button type="button" className="sk-link-btn" onClick={() => setStep(step - 1)}>
              <Icon name="chevron-left" /> Back
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
