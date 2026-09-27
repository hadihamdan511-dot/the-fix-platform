'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/serverAuth';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { generateRecommendation, MIN_RETENTION_ENTRIES } from '@/lib/pricingRecommendation';

export type ActionResult = { ok: true } | { ok: false; error: string };

async function getAccess(branchId: string) {
  const authedClient = await createServerSupabaseClient();
  const { data: userData } = await authedClient.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data: branch } = await authedClient
    .from('branches')
    .select('id, account_id, avg_order_value')
    .eq('id', branchId)
    .single();
  if (!branch) return null;

  return { userId: user.id, branch };
}

async function regenerate(branchId: string, accountId: string, avgOrderValue: number | null, userId: string) {
  const service = createServiceRoleClient();

  const { data: entries } = await service
    .from('retention_entries')
    .select('retention_reason, purchase_count_estimate')
    .eq('branch_id', branchId);

  if (avgOrderValue == null || !entries || entries.length < MIN_RETENTION_ENTRIES) {
    await service.from('pricing_recommendations').delete().eq('branch_id', branchId);
    return;
  }

  const result = generateRecommendation(
    Number(avgOrderValue),
    entries.map((e) => ({
      retentionReason: e.retention_reason,
      purchaseCountEstimate: e.purchase_count_estimate || 0,
    }))
  );

  await service.from('pricing_recommendations').insert({
    branch_id: branchId,
    dominant_reason: result.dominantReason,
    recommendation_text: result.recommendationText,
    estimated_revenue_low: result.estimatedRevenueLow,
    estimated_revenue_high: result.estimatedRevenueHigh,
    formula_snapshot: result.formulaSnapshot,
  });

  const { data: existingLog } = await service
    .from('recommendation_log')
    .select('id')
    .eq('branch_id', branchId)
    .eq('source', 'feature_2')
    .eq('recommendation_text', result.recommendationText)
    .limit(1)
    .maybeSingle();

  if (!existingLog) {
    await service.from('recommendation_log').insert({
      account_id: accountId,
      branch_id: branchId,
      source: 'feature_2',
      recommendation_text: result.recommendationText,
      updated_by: userId,
    });
  }
}

function refreshPages(branchId: string) {
  revalidatePath('/branches/' + branchId + '/retention');
  revalidatePath('/dashboard');
  revalidatePath('/recommendations');
}

export async function updateAvgOrderValue(branchId: string, value: number): Promise<ActionResult> {
  if (!Number.isFinite(value) || value <= 0 || value > 10000000) {
    return { ok: false, error: 'Enter a number greater than 0.' };
  }

  const access = await getAccess(branchId);
  if (!access) return { ok: false, error: 'Branch not found or not accessible.' };

  const service = createServiceRoleClient();
  const { error } = await service.from('branches').update({ avg_order_value: value }).eq('id', branchId);
  if (error) return { ok: false, error: error.message };

  await regenerate(branchId, access.branch.account_id, value, access.userId);
  refreshPages(branchId);
  return { ok: true };
}

export async function deleteRetentionEntry(branchId: string, entryId: string): Promise<ActionResult> {
  const access = await getAccess(branchId);
  if (!access) return { ok: false, error: 'Branch not found or not accessible.' };

  const service = createServiceRoleClient();
  const { error } = await service
    .from('retention_entries')
    .delete()
    .eq('id', entryId)
    .eq('branch_id', branchId);
  if (error) return { ok: false, error: error.message };

  await regenerate(branchId, access.branch.account_id, access.branch.avg_order_value, access.userId);
  refreshPages(branchId);
  return { ok: true };
}