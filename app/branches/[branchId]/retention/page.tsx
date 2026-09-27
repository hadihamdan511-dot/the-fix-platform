import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/serverAuth';
import { RetentionEntryForm } from '@/components/RetentionEntryForm';
import { PricingRecommendationCard } from '@/components/PricingRecommendationCard';
import { AvgOrderValueForm } from '@/components/AvgOrderValueForm';
import { RetentionEntryList, type RetentionEntryRow } from '@/components/RetentionEntryList';
import { MIN_RETENTION_ENTRIES } from '@/lib/pricingRecommendation';
import type { PricingRecommendation } from '@/lib/types';
import { getLang } from '@/lib/getLang';
import { getRetentionDict } from '@/lib/dictRetention';

interface PageProps {
  params: Promise<{ branchId: string }>;
}

export default async function RetentionPage({ params }: PageProps) {
  const { branchId } = await params;
  const t = getRetentionDict(await getLang());
  const supabase = await createServerSupabaseClient();

  const { data: branch } = await supabase
    .from('branches')
    .select('id, name, avg_order_value')
    .eq('id', branchId)
    .single();

  if (!branch) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-gray-600">{t.unavailable}</p>
      </div>
    );
  }

  const { data: entriesData } = await supabase
    .from('retention_entries')
    .select('id, customer_label, purchase_count_estimate, retention_reason')
    .eq('branch_id', branchId)
    .order('created_at', { ascending: true });
  const entries = (entriesData ?? []) as RetentionEntryRow[];

  const { data: latestRecommendation } = await supabase
    .from('pricing_recommendations')
    .select('*')
    .eq('branch_id', branchId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle<PricingRecommendation>();

  const avgOrderValue = branch.avg_order_value != null ? Number(branch.avg_order_value) : null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 p-6">
      <div>
        <Link href="/dashboard" className="text-sm text-[#1F3864] underline">
          {t.backToDashboard}
        </Link>
        <p className="mt-3 text-sm font-medium text-gray-500">{branch.name}</p>
        <h1 className="text-2xl font-bold text-[#1F3864]">{t.pageTitle}</h1>
      </div>

      <AvgOrderValueForm branchId={branch.id} currentValue={avgOrderValue} />

      {latestRecommendation ? (
        <PricingRecommendationCard recommendation={latestRecommendation} />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          {avgOrderValue == null ? t.needAov(MIN_RETENTION_ENTRIES) : t.noRecYet(MIN_RETENTION_ENTRIES)}
        </div>
      )}

      <RetentionEntryList branchId={branch.id} entries={entries} />

      <RetentionEntryForm branchId={branch.id} existingEntryCount={entries.length} />
    </div>
  );
}