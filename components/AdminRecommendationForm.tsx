'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

type Source = 'consultation' | 'feature_1';
type Status = 'not_started' | 'in_progress' | 'implemented' | 'deferred';

interface Account { id: string; name: string; }
interface Branch { id: string; name: string; account_id: string; }

const inputClass = 'w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800';

function today() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function AdminRecommendationForm({ accounts, branches }: { accounts: Account[]; branches: Branch[] }) {
  const router = useRouter();
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [branchId, setBranchId] = useState('');
  const [source, setSource] = useState<Source>('consultation');
  const [text, setText] = useState('');
  const [status, setStatus] = useState<Status>('not_started');
  const [dateGiven, setDateGiven] = useState(today());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const accountBranches = useMemo(() => branches.filter((b) => b.account_id === accountId), [branches, accountId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!accountId) {
      setError('Choose a client account.');
      return;
    }
    if (!text.trim()) {
      setError('Write the recommendation.');
      return;
    }
    setSaving(true);
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('recommendation_log').insert({
      account_id: accountId,
      branch_id: branchId || null,
      source,
      recommendation_text: text.trim(),
      status,
      date_given: dateGiven,
      updated_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setText('');
    setStatus('not_started');
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-gray-700">Client account</span>
          <select
            className={inputClass}
            value={accountId}
            onChange={(e) => {
              setAccountId(e.target.value);
              setBranchId('');
            }}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-gray-700">Branch</span>
          <select className={inputClass} value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            <option value="">Account-wide (all branches)</option>
            {accountBranches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-gray-700">Source</span>
          <select className={inputClass} value={source} onChange={(e) => setSource(e.target.value as Source)}>
            <option value="consultation">Consultation</option>
            <option value="feature_1">Competitor tracking</option>
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-gray-700">Date given</span>
          <input type="date" className={inputClass} value={dateGiven} onChange={(e) => setDateGiven(e.target.value)} />
        </label>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-medium text-gray-700">Recommendation</span>
        <textarea
          dir="auto"
          rows={3}
          className={inputClass}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Rival Boutique started a 20% discount campaign - consider reviewing your own pricing."
        />
      </label>

      <label className="block space-y-1 text-sm sm:w-1/2">
        <span className="font-medium text-gray-700">Starting status</span>
        <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as Status)}>
          <option value="not_started">Not started</option>
          <option value="in_progress">In progress</option>
          <option value="implemented">Implemented</option>
          <option value="deferred">Deferred</option>
        </select>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">Logged. The client will see it in their recommendation log.</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-[#1F3864] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Log recommendation'}
      </button>
    </form>
  );
}

export function AdminDeleteLogButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm('Delete this log entry? The client will no longer see it.')) return;
    setBusy(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from('recommendation_log').delete().eq('id', id);
    setBusy(false);
    if (error) {
      window.alert(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <button type="button" onClick={remove} disabled={busy} className="text-xs text-red-600 hover:underline disabled:opacity-50">
      {busy ? 'Deleting...' : 'Delete'}
    </button>
  );
}