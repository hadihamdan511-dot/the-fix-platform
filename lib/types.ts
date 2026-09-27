// Mirrors the enums and core rows defined in schema.sql.
export type UserRole = 'client_owner' | 'client_staff' | 'fix_admin';

export type RetentionReason =
  | 'price'
  | 'product_quality'
  | 'service_responsiveness'
  | 'lack_of_alternatives'
  | 'trust_relationship'
  | 'not_sure';

export type RecommendationSource = 'feature_1' | 'feature_2' | 'consultation';
export type RecommendationStatus = 'not_started' | 'in_progress' | 'implemented' | 'deferred';

export interface Branch {
  id: string;
  account_id: string;
  name: string;
  location: string | null;
  avg_order_value: number | null;
  created_at: string;
}

export interface RetentionEntry {
  id: string;
  branch_id: string;
  customer_label: string;
  purchase_count_estimate: number;
  retention_reason: RetentionReason;
  entered_by: string | null;
  entry_date: string;
  created_at: string;
}

export interface PricingRecommendation {
  id: string;
  branch_id: string;
  dominant_reason: RetentionReason;
  recommendation_text: string;
  estimated_revenue_low: number;
  estimated_revenue_high: number;
  formula_snapshot: PricingFormulaSnapshot;
  generated_at: string;
}

export interface PricingFormulaSnapshot {
  avg_order_value: number;
  repeat_customer_count: number;
  dominant_reason: RetentionReason;
  reason_breakdown: Record<RetentionReason, number>;
  price_increase_pct_range: [number, number];
  formula: string;
  assumption: string;
  is_tie: boolean;
}export interface RecommendationLogEntry {
  id: string;
  account_id: string;
  branch_id: string | null;
  source: RecommendationSource;
  recommendation_text: string;
  date_given: string;
  status: RecommendationStatus;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  branches?: { name: string } | null;
}export interface CompetitorEntry {
  id: string;
  competitor_id: string;
  follower_count: number | null;
  posting_frequency: string | null;
  price_change_note: string | null;
  is_flagged: boolean;
  entry_date: string;
  entered_by: string | null;
  created_at: string;
}

export interface Competitor {
  id: string;
  branch_id: string;
  name: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  competitor_entries?: CompetitorEntry[];
}

export interface OwnSocialEntry {
  id: string;
  branch_id: string;
  follower_count: number | null;
  posting_frequency: string | null;
  notes: string | null;
  entry_date: string;
  entered_by: string | null;
  created_at: string;
}