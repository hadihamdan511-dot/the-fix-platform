import { createServerSupabaseClient } from '@/lib/supabase/serverAuth';
import { RecommendationStatusSelect } from '@/components/RecommendationStatusSelect';
import type { RecommendationLogEntry, RecommendationSource } from '@/lib/types';

const SOURCE_LABELS: Record<RecommendationSource, string> = {
  feature_1: 'Competitor tracking',
  feature_2: 'Pricing',
  consultation: 'Consultation',
};

function quarterStart(d: Date) {
  const month = Math.floor(d.getMonth() / 3) * 3;
  return `${d.getFullYear()}-${String(month + 1).padStart(2, '0')}-01`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function RecommendationsPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('recommendation_log')
    .select('*, branches(name)')
    .order('date_given', { ascending: false })
    .order('created_at', { ascending: false });

  const entries = (data ?? []) as RecommendationLogEntry[];
  const qStart = quarterStart(new Date());
  const thisQuarter = entries.filter((e) => e.date_given >= qStart);
  const implemented = thisQuarter.filter((e) => e.status === 'implemented').length;

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F3864]">Recommendation log</h1>
        <p className="text-sm text-gray-500">Every recommendation we&apos;ve given you, and where it stands. Update the status as you go.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {thisQuarter.length === 0 ? (
          <p className="text-gray-600">No recommendations logged this quarter yet.</p>
        ) : (
          <p className="text-gray-700">
            <span className="text-3xl font-bold text-[#BF8F00]">{implemented} of {thisQuarter.length}</span>
            <span className="ml-2">recommendations implemented this quarter</span>
          </p>
        )}
      </div>

      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e.id} className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-800">{e.recommendation_text}</p>
              <p className="text-xs text-gray-500">
                {SOURCE_LABELS[e.source]}
                {e.branches?.name ? ` · ${e.branches.name}` : ''} · Given {formatDate(e.date_given)}
              </p>
            </div>
            <RecommendationStatusSelect id={e.id} initialStatus={e.status} />
          </div>
        ))}
      </div>
    </div>
  );
}