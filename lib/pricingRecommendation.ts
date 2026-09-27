import type { RetentionReason, PricingFormulaSnapshot } from './types';

export interface RetentionEntryInput {
  retentionReason: RetentionReason;
}

export interface PricingRecommendationResult {
  dominantReason: RetentionReason;
  isTie: boolean;
  recommendationText: string;
  estimatedRevenueLow: number;
  estimatedRevenueHigh: number;
  formulaSnapshot: PricingFormulaSnapshot;
}

export const MIN_RETENTION_ENTRIES = 5;

const PRICE_INCREASE_RANGE: Record<RetentionReason, [number, number]> = {
  trust_relationship: [0.03, 0.07],
  product_quality: [0.03, 0.07],
  service_responsiveness: [0.03, 0.06],
  lack_of_alternatives: [0.02, 0.05],
  price: [0, 0],
  not_sure: [0, 0],
};

const REASON_LABELS: Record<RetentionReason, string> = {
  price: 'Price',
  product_quality: 'Product quality',
  service_responsiveness: 'Service & responsiveness',
  lack_of_alternatives: 'Lack of market alternatives',
  trust_relationship: 'Trust & relationship',
  not_sure: 'Not sure',
};

export function reasonLabel(reason: RetentionReason): string {
  return REASON_LABELS[reason];
}

export function computeDominantReason(entries: RetentionEntryInput[]): {
  dominant: RetentionReason;
  isTie: boolean;
  counts: Record<RetentionReason, number>;
} {
  const counts: Record<RetentionReason, number> = {
    price: 0, product_quality: 0, service_responsiveness: 0,
    lack_of_alternatives: 0, trust_relationship: 0, not_sure: 0,
  };
  for (const entry of entries) counts[entry.retentionReason]++;
  const max = Math.max(...Object.values(counts));
  const topReasons = (Object.keys(counts) as RetentionReason[]).filter((r) => counts[r] === max);
  return { dominant: topReasons[0], isTie: topReasons.length > 1, counts };
}

export function generateRecommendation(
  avgOrderValue: number,
  entries: RetentionEntryInput[]
): PricingRecommendationResult {
  if (entries.length < MIN_RETENTION_ENTRIES) {
    throw new Error(`At least ${MIN_RETENTION_ENTRIES} retention entries are required to generate a recommendation.`);
  }
  const { dominant, isTie, counts } = computeDominantReason(entries);
  const repeatCustomerCount = entries.length;
  const [pctLow, pctHigh] = PRICE_INCREASE_RANGE[dominant];

  let recommendationText: string;
  if (dominant === 'price') {
    recommendationText = 'We recommend against raising prices until other retention factors — service, trust, or product quality — are strengthened. Right now, price appears to be the main reason these customers stay.';
  } else if (dominant === 'not_sure') {
    recommendationText = "Retention reasons aren't clear enough yet to recommend a pricing move. Gather a bit more detail on why these customers keep buying before adjusting prices.";
  } else {
    recommendationText = `You likely have room to raise prices cautiously. ${reasonLabel(dominant)} appears to be the main reason these customers stay, which typically means demand is less sensitive to a modest price increase.`;
  }

  const estimatedRevenueLow = Math.round(avgOrderValue * repeatCustomerCount * pctLow);
  const estimatedRevenueHigh = Math.round(avgOrderValue * repeatCustomerCount * pctHigh);

  const formulaSnapshot: PricingFormulaSnapshot = {
    avg_order_value: avgOrderValue,
    repeat_customer_count: repeatCustomerCount,
    dominant_reason: dominant,
    reason_breakdown: counts,
    price_increase_pct_range: [pctLow, pctHigh],
    formula: 'avg_order_value × repeat_customer_count × price_increase_pct',
    assumption: "Assumes each repeat customer places roughly one order per month at your branch's average order value, and counts revenue from these repeat customers only. This is a conservative, directional estimate — not a guarantee.",
    is_tie: isTie,
  };

  return { dominantReason: dominant, isTie, recommendationText, estimatedRevenueLow, estimatedRevenueHigh, formulaSnapshot };
}