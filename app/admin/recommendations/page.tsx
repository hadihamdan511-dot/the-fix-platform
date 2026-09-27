import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/serverAuth';
import { AdminRecommendationForm, AdminDeleteLogButton } from '@/components/AdminRecommendationForm';

interface LogRow {
  id: string;
  source: 'consultation' | 'feature_1' | 'feature_2';
  recommendation_text: string;
  status: string;
  date_given: string;
  branches: { name: string } | null;
  accounts: { name: string } | null;
}

const SOURCE_LABELS: Record<string, string> = {
  consultation: 'Consultation',
  feature_1: 'Competitor tracking',
  feature_2: 'Pricing',
};

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  implemented: 'Implemented',
  deferred: 'Deferred',
};

export default async function AdminRecommendationsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'fix_admin') {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-gray-600">This page is for The Fix team only.</p>
        <Link href="/dashboard" className="mt-3 inline-block text-sm text-[#1F3864] underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const [{ data: accounts }, { data: branches }, { data: recent }] = await Promise.all([
    supabase.from('accounts').select('id, name').order('name'),
    supabase.from('branches').select('id, name, account_id').order('name'),
    supabase
      .from('recommendation_log')
      .select('id, source, recommendation_text, status, date_given, branches(name), accounts(name)')
      .in('source', ['consultation', 'feature_1'])
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  const rows = (recent ?? []) as unknown as LogRow[];

  return (
    <div dir="ltr" className="mx-auto w-full max-w-3xl space-y-8 p-6 text-left">
      <div>
        <Link href="/dashboard" className="text-sm text-[#1F3864] underline">
          ← Back to dashboard
        </Link>
        <p className="mt-3 text-sm font-medium text-gray-500">The Fix team</p>
        <h1 className="text-2xl font-bold text-[#1F3864]">Log a recommendation</h1>
        <p className="text-sm text-gray-500">
          For recommendations from consultations or competitor observations. Pricing recommendations are logged automatically.
        </p>
      </div>

      <AdminRecommendationForm accounts={accounts ?? []} branches={branches ?? []} />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1F3864]">Recently logged by the team</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">Nothing logged yet.</p>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4">
              <div className="space-y-1">
                <p dir="auto" className="text-sm text-gray-800">{r.recommendation_text}</p>
                <p className="text-xs text-gray-500">
                  {r.accounts?.name}
                  {r.branches?.name ? ' · ' + r.branches.name : ' · Account-wide'}
                  {' · '}{SOURCE_LABELS[r.source]}
                  {' · '}{r.date_given}
                  {' · '}{STATUS_LABELS[r.status] ?? r.status}
                </p>
              </div>
              <AdminDeleteLogButton id={r.id} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}