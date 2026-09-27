import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/serverAuth';
import { AddCompetitorForm, LogEntryForm, CopyToBranchesButton } from '@/components/CompetitorForms';
import type { Competitor, OwnSocialEntry } from '@/lib/types';
import { getLang } from '@/lib/getLang';
import { getCompetitorsDict } from '@/lib/dictCompetitors';

interface PageProps {
  params: Promise<{ branchId: string }>;
}

function fmtNumber(n: number | null | undefined) {
  return n == null ? '-' : n.toLocaleString('en-US');
}

function fmtDate(iso: string | null | undefined, lang: 'en' | 'ar') {
  if (!iso) return '-';
  const locale = lang === 'ar' ? 'ar-LB-u-nu-latn' : 'en-GB';
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

function sortNewest<T extends { created_at: string }>(rows: T[] | null | undefined): T[] {
  return [...(rows ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

function latestValue<T, K extends keyof T>(rows: T[], key: K): T[K] | null {
  const hit = rows.find((r) => r[key] != null && (r[key] as unknown) !== '');
  return hit ? hit[key] : null;
}

export default async function CompetitorsPage({ params }: PageProps) {
  const { branchId } = await params;
  const lang = await getLang();
  const t = getCompetitorsDict(lang);
  const supabase = await createServerSupabaseClient();

  const { data: branch } = await supabase
    .from('branches')
    .select('id, name, account_id')
    .eq('id', branchId)
    .single();

  if (!branch) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-gray-600">{t.unavailable}</p>
      </div>
    );
  }

  const [{ data: siblingData }, { data: competitorData }, { data: ownData }] = await Promise.all([
    supabase.from('branches').select('id, name').eq('account_id', branch.account_id).neq('id', branchId).order('name'),
    supabase.from('competitors').select('*, competitor_entries(*)').eq('branch_id', branchId).order('name'),
    supabase.from('own_social_entries').select('*').eq('branch_id', branchId),
  ]);

  const siblings: { id: string; name: string }[] = siblingData ?? [];
  const competitors = (competitorData ?? []) as Competitor[];
  const ownRows = sortNewest(ownData as OwnSocialEntry[] | null);

  let siblingCompetitors: { branch_id: string; name: string }[] = [];
  if (siblings.length > 0) {
    const { data } = await supabase
      .from('competitors')
      .select('branch_id, name')
      .in('branch_id', siblings.map((s) => s.id));
    siblingCompetitors = data ?? [];
  }
  const existing = new Set(siblingCompetitors.map((c) => c.branch_id + '|' + c.name.trim().toLowerCase()));

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 p-6">
      <div>
        <Link href="/dashboard" className="text-sm text-[#1F3864] underline">
          {t.backToDashboard}
        </Link>
        <p className="mt-3 text-sm font-medium text-gray-500">{branch.name}</p>
        <h1 className="text-2xl font-bold text-[#1F3864]">{t.title}</h1>
        <p className="mt-1 text-sm text-gray-500">{t.intro}</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-start text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3 text-start">{t.colFollowers}</th>
              <th className="px-4 py-3 text-start">{t.colFrequency}</th>
              <th className="px-4 py-3 text-start">{t.colNotes}</th>
              <th className="px-4 py-3 text-start">{t.colUpdated}</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            <tr className="border-b border-gray-100 bg-[#1F3864]/5">
              <td className="px-4 py-3 font-semibold text-[#1F3864]">{t.you(branch.name)}</td>
              <td className="px-4 py-3">{fmtNumber(latestValue(ownRows, 'follower_count'))}</td>
              <td className="px-4 py-3">{latestValue(ownRows, 'posting_frequency') ?? '-'}</td>
              <td className="px-4 py-3">{latestValue(ownRows, 'notes') ?? '-'}</td>
              <td className="px-4 py-3 text-gray-500">{fmtDate(ownRows[0]?.entry_date, lang)}</td>
            </tr>
            {competitors.map((c) => {
              const rows = sortNewest(c.competitor_entries);
              return (
                <tr key={c.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium">
                    {c.name}
                    {rows[0]?.is_flagged && (
                      <span className="ms-2 rounded bg-[#BF8F00]/15 px-1.5 py-0.5 text-xs font-semibold text-[#BF8F00]">
                        {t.flagged}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{fmtNumber(latestValue(rows, 'follower_count'))}</td>
                  <td className="px-4 py-3">{latestValue(rows, 'posting_frequency') ?? '-'}</td>
                  <td className="px-4 py-3">{latestValue(rows, 'price_change_note') ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{fmtDate(rows[0]?.entry_date, lang)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="font-semibold text-[#1F3864]">{t.yourNumbers}</p>
          <LogEntryForm target={{ kind: 'own', branchId: branch.id }} label={t.updateYourNumbers} />
        </div>

        {competitors.map((c) => {
          const targets = siblings.filter((s) => !existing.has(s.id + '|' + c.name.trim().toLowerCase()));
          return (
            <div key={c.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">{c.name}</p>
                  {c.notes && <p className="text-xs text-gray-500">{c.notes}</p>}
                </div>
                <CopyToBranchesButton name={c.name} notes={c.notes} targetBranches={targets} />
              </div>
              <LogEntryForm target={{ kind: 'competitor', competitorId: c.id }} label={t.logNewNumbers} />
            </div>
          );
        })}

        <AddCompetitorForm branchId={branch.id} />
      </div>
    </div>
  );
}