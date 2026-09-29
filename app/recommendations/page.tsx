import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/serverAuth';
import { RecommendationStatusSelect } from '@/components/RecommendationStatusSelect';
import type { RecommendationLogEntry } from '@/lib/types';
import { getLang } from '@/lib/getLang';
import { getRecommendationsDict } from '@/lib/dictRecommendations';
import { translateRecText } from '@/lib/translateRecText';

function quarterStart(d: Date) {
  const month = Math.floor(d.getMonth() / 3) * 3;
  return d.getFullYear() + '-' + String(month + 1).padStart(2, '0') + '-01';
}

function formatDate(iso: string, lang: 'en' | 'ar') {
  const locale = lang === 'ar' ? 'ar-LB-u-nu-latn' : 'en-GB';
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function RecommendationsPage() {
  const lang = await getLang();
  const t = getRecommendationsDict(lang);
  const supabase = await createServerSupabaseClient();

  const emptyList =
    lang === 'ar'
      ? 'لا توجد توصيات بعد. ستظهر هنا التوصيات من التسعير والاستشارات فور تسجيلها.'
      : 'No recommendations yet. Pricing and consultation recommendations will appear here as soon as they are logged.';

  const [{ data: accountData }, { data }] = await Promise.all([
    supabase.from('accounts').select('id, name').order('name'),
    supabase
      .from('recommendation_log')
      .select('*, branches(name)')
      .order('date_given', { ascending: false })
      .order('created_at', { ascending: false }),
  ]);

  const accounts = (accountData ?? []) as { id: string; name: string }[];
  const entries = (data ?? []) as RecommendationLogEntry[];
  const qStart = quarterStart(new Date());
  const showAccountNames = accounts.length > 1;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-10 p-6">
      <div>
        <Link href="/dashboard" className="text-sm text-[#1F3864] underline">
          {t.backToDashboard}
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-[#1F3864]">{t.title}</h1>
        <p className="text-sm text-gray-500">{t.intro}</p>
      </div>

      {accounts.map((account) => {
        const accountEntries = entries.filter((e) => e.account_id === account.id);
        const thisQuarter = accountEntries.filter((e) => e.date_given >= qStart);
        const implemented = thisQuarter.filter((e) => e.status === 'implemented').length;

        return (
          <section
            key={account.id}
            className={showAccountNames ? 'space-y-4 rounded-2xl border-2 border-[#1F3864]/15 p-4' : 'space-y-4'}
          >
            {showAccountNames && <h2 className="text-xl font-bold text-[#1F3864]">{account.name}</h2>}

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              {thisQuarter.length === 0 ? (
                <p className="text-gray-600">{t.noLogs}</p>
              ) : (
                <p className="text-gray-700">
                  <span className="text-3xl font-bold text-[#BF8F00]">{t.implementedOf(implemented, thisQuarter.length)}</span>
                  <span className="ms-2">{t.implementedSuffix}</span>
                </p>
              )}
            </div>

            {accountEntries.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">{emptyList}</p>
            ) : (
              <div className="space-y-3">
                {accountEntries.map((e) => (
                  <div
                    key={e.id}
                    className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                  >
                    <div className="space-y-1">
                      <p dir="auto" className="text-sm text-gray-800">
                        {translateRecText(e.recommendation_text, lang)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {showAccountNames && <span className="font-semibold text-[#1F3864]">{account.name} · </span>}
                        {t.sources[e.source]}
                        {e.branches?.name ? ' · ' + e.branches.name : ''} · {t.given(formatDate(e.date_given, lang))}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <RecommendationStatusSelect id={e.id} initialStatus={e.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}