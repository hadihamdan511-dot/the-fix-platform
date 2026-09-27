import { createServerSupabaseClient } from '@/lib/supabase/serverAuth';
import { RetentionEntryForm } from '@/components/RetentionEntryForm';
import { PricingRecommendationCard } from '@/components/PricingRecommendationCard';
import { MIN_RETENTION_ENTRIES } from '@/lib/pricingRecommendation';
import type { PricingRecommendation } from '@/lib/types';

interface PageProps { params: Promise<{ branchId: string }>; }

export default async function RetentionPage({ params }: PageProps) {
  const { branchId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: branch } = await supabase.from('branches').select('id, name, avg_order_value').eq('id', branchId).single();
  if (!branch) {
    return (<div className="mx-auto max-w-2xl p-6"><p className="text-gray-600">This branch isn&apos;t available, or you don&apos;t have access to it.</p></div>);
  }

  const { count: entryCount } = await supabase.from('retention_entries').select('*', { count: 'exact', head: true }).eq('branch_id', branchId);
  const { data: latestRecommendation } = await supabase.from('pricing_recommendations').select('*').eq('branch_id', branchId).order('generated_at', { ascending: false }).limit(1).maybeSingle<PricingRecommendation>();

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <p className="text-sm font-medium text-gray-500">{branch.name}</p>
        <h1 className="text-2xl font-bold text-[#1F3864]">Retention & pricing</h1>
      </div>
      {branch.avg_order_value == null && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          This branch doesn&apos;t have an average order value set yet. Add one before a pricing recommendation can be calculated.
        </div>
      )}
      {latestRecommendation ? (
        <PricingRecommendationCard recommendation={latestRecommendation} />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          No recommendation yet — add at least {MIN_RETENTION_ENTRIES} repeat customers below to generate one.
        </div>
      )}
      <RetentionEntryForm branchId={branch.id} existingEntryCount={entryCount ?? 0} />
    </div>
  );
}