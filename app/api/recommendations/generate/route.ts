import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/serverAuth';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { generateRecommendation, MIN_RETENTION_ENTRIES } from '@/lib/pricingRecommendation';

export async function POST(req: NextRequest) {
  const { branchId } = await req.json();
  if (!branchId) return NextResponse.json({ error: 'branchId is required' }, { status: 400 });

  const authedClient = await createServerSupabaseClient();
  const { data: { user } } = await authedClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { data: branch, error: branchAccessError } = await authedClient
    .from('branches').select('id, account_id, avg_order_value').eq('id', branchId).single();
  if (branchAccessError || !branch) return NextResponse.json({ error: 'Branch not found or not accessible.' }, { status: 404 });
  if (branch.avg_order_value == null) {
    return NextResponse.json({ error: 'This branch needs an average order value before a recommendation can be generated.' }, { status: 422 });
  }

  const { data: entries, error: entriesError } = await authedClient
    .from('retention_entries').select('retention_reason, purchase_count_estimate').eq('branch_id', branchId);
  if (entriesError) return NextResponse.json({ error: entriesError.message }, { status: 500 });
  if (!entries || entries.length < MIN_RETENTION_ENTRIES) {
    return NextResponse.json({ error: `At least ${MIN_RETENTION_ENTRIES} retention entries are needed before a recommendation can be generated.` }, { status: 422 });
  }

  const result = generateRecommendation(
    Number(branch.avg_order_value),
    entries.map((e) => ({
      retentionReason: e.retention_reason,
      purchaseCountEstimate: e.purchase_count_estimate ?? 0,
    }))
  );

  const serviceClient = createServiceRoleClient();
  const { data: saved, error: saveError } = await serviceClient
    .from('pricing_recommendations')
    .insert({
      branch_id: branchId,
      dominant_reason: result.dominantReason,
      recommendation_text: result.recommendationText,
      estimated_revenue_low: result.estimatedRevenueLow,
      estimated_revenue_high: result.estimatedRevenueHigh,
      formula_snapshot: result.formulaSnapshot,
    })
    .select().single();
  if (saveError) return NextResponse.json({ error: saveError.message }, { status: 500 });

  // Log to the accountability log, but only if this exact recommendation isn't logged yet for this branch.
  const { data: existingLog } = await authedClient
    .from('recommendation_log').select('id')
    .eq('branch_id', branchId).eq('source', 'feature_2').eq('recommendation_text', result.recommendationText)
    .limit(1).maybeSingle();
  if (!existingLog) {
    const { error: logError } = await authedClient.from('recommendation_log').insert({
      account_id: branch.account_id,
      branch_id: branchId,
      source: 'feature_2',
      recommendation_text: result.recommendationText,
      updated_by: user.id,
    });
    if (logError) console.error('Could not log recommendation:', logError.message);
  }

  return NextResponse.json({ recommendation: saved });
}