'use client';

import { useState } from 'react';
import type { PricingRecommendation } from '@/lib/types';
import { useLang } from '@/components/LangProvider';
import { getDict } from '@/lib/dictionaries';
import { getRetentionDict } from '@/lib/dictRetention';

interface PricingRecommendationCardProps {
  recommendation: PricingRecommendation;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function PricingRecommendationCard({ recommendation }: PricingRecommendationCardProps) {
  const lang = useLang();
  const reasons = getDict(lang).reasons;
  const t = getRetentionDict(lang).card;
  const [showFormula, setShowFormula] = useState(false);

  const formula = recommendation.formula_snapshot;
  const low = Number(recommendation.estimated_revenue_low);
  const high = Number(recommendation.estimated_revenue_high);
  const hasRevenueImpact = high > 0;

  let text: string;
  if (recommendation.recommendation_text.startsWith('Your customers stay for a mix')) {
    text = t.texts.mixed;
  } else if (formula.dominant_reason === 'price') {
    text = t.texts.price;
  } else if (formula.dominant_reason === 'not_sure') {
    text = t.texts.notSure;
  } else {
    text = t.texts.raise(reasons[formula.dominant_reason]);
  }

  const pctLow = Math.round(formula.price_increase_pct_range[0] * 100);
  const pctHigh = Math.round(formula.price_increase_pct_range[1] * 100);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{t.title}</p>
      <p className="mt-2 text-lg text-[#1F3864]">{text}</p>

      {hasRevenueImpact && (
        <p className="mt-4 text-3xl font-bold text-[#BF8F00]">
          <span dir="ltr" className="inline-block">
            {formatCurrency(low)}–{formatCurrency(high)}
          </span>
          <span className="ms-2 text-base font-medium text-gray-500">{t.perMonth}</span>
        </p>
      )}

      <p className="mt-3 text-sm text-gray-500">
        {t.basedOn(formula.repeat_customer_count)}{' '}
        <span className="font-medium text-gray-700">{reasons[formula.dominant_reason]}</span>
        {formula.is_tie && t.tieNote}
      </p>

      <button
        type="button"
        onClick={() => setShowFormula((v) => !v)}
        className="mt-4 text-sm font-medium text-[#1F3864] hover:underline"
      >
        {showFormula ? t.hide : t.show}
      </button>

      {showFormula && (
        <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          <Row label={t.aovRow} value={formatCurrency(formula.avg_order_value)} ltr />
          <Row label={t.customersRow} value={String(formula.repeat_customer_count)} />
          <Row
            label={t.increaseRow}
            value={pctHigh === 0 ? t.notApplicable : pctLow + '%–' + pctHigh + '%'}
            ltr={pctHigh !== 0}
          />
          <Row label={t.formulaRow} value={t.formula} small />
          <div className="pt-2 text-gray-500">{t.assumption}</div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, ltr, small }: { label: string; value: string; ltr?: boolean; small?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span
        dir={ltr ? 'ltr' : undefined}
        className={small ? 'text-xs text-gray-700' : 'font-medium text-gray-700'}
      >
        {value}
      </span>
    </div>
  );
}