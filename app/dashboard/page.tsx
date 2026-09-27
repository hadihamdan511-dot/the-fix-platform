import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/serverAuth';
import { reasonLabel } from '@/lib/pricingRecommendation';
import type { PricingRecommendation, RecommendationStatus } from '@/lib/types';

// TODO: replace with the real booking link once it's set up.
const BOOKING_URL = '#';

const LOCKED_FEATURES = [
  { title: 'Video & content gap analysis', description: 'Which formats and topics your competitors win on — and what you’re missing.' },
  { title: 'Budget-tailored growth roadmap', description: 'A step-by-step plan sized to what you can actually spend.' },
  { title: 'Cross-sell & basket analysis', description: 'Which products sell together, and how to raise your average order.' },
];

interface BranchRow { id: string; name: string; account_id: string; }
interface LogRow { account_id: string; status: RecommendationStatus; date_given: string; }

function usd(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

function quarterStart(d: Date) {
  const month = Math.floor(d.getMonth() / 3) * 3;
  return `${d.getFullYear()}-${String(month + 1).padStart(2, '0')}-01`;
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: accounts }, { data: branchData }, { data: recData }, { data: logData }] = await Promise.all([
    supabase.from('accounts').select('id, name').order('name'),
    supabase.from('branches').select('id, name, account_id').order('name'),
    supabase.from('pricing_recommendations').select('*').order('generated_at', { ascending: false }),
    supabase.from('recommendation_log').select('account_id, status, date_given'),
  ]);

  const branches = (branchData ?? []) as BranchRow[];
  const logs = (logData ?? []) as LogRow[];

  // Latest recommendation per branch (rows arrive newest first).
  const latestRec = new Map<string, PricingRecommendation>();
  for (const rec of (recData ?? []) as PricingRecommendation[]) {
    if (!latestRec.has(rec.branch_id)) latestRec.set(rec.branch_id, rec);
  }

  if (!accounts || accounts.length === 0) {
    return <div className="mx-auto max-w-2xl p-6"><p className="text-gray-600">No account is linked to your login yet. Contact The Fix team.</p></div>;
  }

  const qStart = quarterStart(new Date());

  return (
    <div className="mx-auto max-w-4xl space-y-16 p-6">
      {accounts.map((account) => {
        const lines = branches
          .filter((b) => b.account_id === account.id)
          .map((b) => ({ branch: b, rec: latestRec.get(b.id) ?? null }));
        const totalLow = lines.reduce((sum, l) => sum + (l.rec ? Number(l.rec.estimated_revenue_low) : 0), 0);
        const totalHigh = lines.reduce((sum, l) => sum + (l.rec ? Number(l.rec.estimated_revenue_high) : 0), 0);
        const quarterLogs = logs.filter((l) => l.account_id === account.id && l.date_given >= qStart);
        const implemented = quarterLogs.filter((l) => l.status === 'implemented').length;

        return (
          <section key={account.id} className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-500">The Fix</p>
              <h1 className="text-2xl font-bold text-[#1F3864]">{account.name}</h1>
            </div>

            {/* Headline */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Estimated monthly opportunity</p>
              <p className="mt-2 text-5xl font-bold text-[#BF8F00]">
                {totalHigh > 0 ? `${usd(totalLow)}–${usd(totalHigh)}` : usd(0)}
              </p>
              <p className="mt-1 text-sm text-gray-500">per month, across {lines.length} {lines.length === 1 ? 'branch' : 'branches'}</p>
              <p className="mt-4 text-sm text-gray-600">
                Right now this figure comes only from pricing recommendations. Competitor tracking is shown for context,
                but doesn&apos;t add to this number yet.
              </p>

              {/* Line items */}
              <div className="mt-6 divide-y divide-gray-100 border-t border-gray-100">
                {lines.map(({ branch, rec }) => (
                  <div key={branch.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{branch.name}</p>
                      <p className="text-xs text-gray-500">
                        <Link href={`/branches/${branch.id}/retention`} className="hover:underline">Retention &amp; pricing</Link>
                        {' · '}
                        <Link href={`/branches/${branch.id}/competitors`} className="hover:underline">Competitors</Link>
                      </p>
                    </div>
                    <div className="text-sm sm:text-right">
                      {!rec ? (
                        <Link href={`/branches/${branch.id}/retention`} className="text-[#1F3864] hover:underline">
                          Not calculated yet — add repeat customers
                        </Link>
                      ) : Number(rec.estimated_revenue_high) > 0 ? (
                        <span className="font-semibold text-gray-800">
                          {usd(Number(rec.estimated_revenue_low))}–{usd(Number(rec.estimated_revenue_high))}
                        </span>
                      ) : (
                        <span className="text-gray-600">
                          {usd(0)} — {rec.dominant_reason === 'price'
                            ? 'we’re advising against a price increase here'
                            : 'retention reasons are too unclear to estimate yet'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Transparency */}
              <details className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                <summary className="cursor-pointer font-medium text-[#1F3864]">How we calculated this</summary>
                <div className="mt-3 space-y-2">
                  <p>
                    We add up the latest pricing estimate for each branch. Each branch&apos;s estimate is:
                    average order value × repeat customers counted × a suggested price increase. The increase is
                    a modest range based on the main reason those customers keep buying.
                  </p>
                  {lines.filter((l) => l.rec).map(({ branch, rec }) => {
                    const f = rec!.formula_snapshot;
                    return (
                      <p key={branch.id} className="font-mono text-xs text-gray-600">
                        {branch.name}: {usd(f.avg_order_value)} × {f.repeat_customer_count} customers ×{' '}
                        {pct(f.price_increase_pct_range[0])}–{pct(f.price_increase_pct_range[1])} ={' '}
                        {usd(Number(rec!.estimated_revenue_low))}–{usd(Number(rec!.estimated_revenue_high))}
                        {' '}(main reason: {reasonLabel(f.dominant_reason)})
                      </p>
                    );
                  })}
                  <p className="text-gray-500">
                    It assumes roughly one order per month per repeat customer and counts repeat customers only.
                    It&apos;s a conservative, directional estimate — not a guarantee.
                  </p>
                </div>
              </details>
            </div>

            {/* Accountability */}
            <Link href="/recommendations" className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:border-[#1F3864]/40">
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Accountability</p>
              {quarterLogs.length === 0 ? (
                <p className="mt-2 text-gray-600">No recommendations logged this quarter yet.</p>
              ) : (
                <p className="mt-2 text-gray-700">
                  <span className="text-3xl font-bold text-[#1F3864]">{implemented} of {quarterLogs.length}</span>
                  <span className="ml-2">recommendations implemented this quarter →</span>
                </p>
              )}
            </Link>

            {/* Locked features */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {LOCKED_FEATURES.map((feature) => (
                <div key={feature.title} className="flex flex-col rounded-xl border border-dashed border-gray-300 bg-white p-5">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                  <p className="mt-3 font-semibold text-gray-800">{feature.title}</p>
                  <p className="mt-1 flex-1 text-sm text-gray-500">{feature.description}</p>
                  <p className="mt-3 text-xs font-medium text-gray-500">Available with a human consultation</p>
                  <a href={BOOKING_URL} className="mt-3 rounded-md bg-[#BF8F00] px-3 py-2 text-center text-sm font-semibold text-white hover:opacity-90">
                    Book a consultation
                  </a>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}