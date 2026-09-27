'use client';

import { useState } from 'react';
import type { PricingRecommendation } from '@/lib/types';
import { reasonLabel } from '@/lib/pricingRecommendation';

interface PricingRecommendationCardProps { recommendation: PricingRecommendation; }

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function PricingRecommendationCard({ recommendation }: PricingRecommendationCardProps) {
  const [showFormula, setShowFormula] = useState(false);
  const { formula_snapshot: formula } = recommendation;
  const hasRevenueImpact = recommendation.estimated_revenue_high > 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">Pricing recommendation</p>
      <p className="mt-2 text-lg text-[#1F3864]">{recommendation.recommendation_text}</p>
      {hasRevenueImpact && (
        <p className="mt-4 text-3xl font-bold text-[#BF8F00]">
          {formatCurrency(recommendation.estimated_revenue_low)}–{formatCurrency(recommendation.estimated_revenue_high)}
          <span className="ml-1 text-base font-medium text-gray-500">/month potential</span>
        </p>
      )}
      <p className="mt-3 text-sm text-gray-500">
        Based on {formula.repeat_customer_count} repeat customers, most commonly retained by{' '}
        <span className="font-medium text-gray-700">{reasonLabel(formula.dominant_reason)}</span>
        {formula.is_tie && ' (tied with another reason — worth a closer look)'}.
      </p>
      <button type="button" onClick={() => setShowFormula((v) => !v)} className="mt-4 text-sm font-medium text-[#1F3864] hover:underline">
        {showFormula ? 'Hide' : 'How we calculated this'}
      </button>
      {showFormula && (
        <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          <Row label="Average order value" value={formatCurrency(formula.avg_order_value)} />
          <Row label="Repeat customers counted" value={String(formula.repeat_customer_count)} />
          <Row label="Suggested price increase" value={formula.price_increase_pct_range[1] === 0 ? 'Not applicable — see recommendation above' : `${formula.price_increase_pct_range[0] * 100}%–${formula.price_increase_pct_range[1] * 100}%`} />
          <Row label="Formula" value={formula.formula} mono />
          <div className="pt-2 text-gray-500">{formula.assumption}</div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className={mono ? 'font-mono text-xs text-gray-700' : 'font-medium text-gray-700'}>{value}</span>
    </div>
  );
}