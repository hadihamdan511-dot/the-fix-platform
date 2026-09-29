'use client';

import { useState, useTransition } from 'react';
import { createClientAccount, type NewBranchInput, type NewClientResult } from '@/lib/actions/admin';

const inputClass = 'w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800';

const emptyBranch = (): NewBranchInput => ({ name: '', location: '', avgOrderValue: '' });

export function NewClientForm() {
  const [accountName, setAccountName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [branches, setBranches] = useState<NewBranchInput[]>([emptyBranch()]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Extract<NewClientResult, { ok: true }> | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateBranch(index: number, patch: Partial<NewBranchInput>) {
    setBranches((prev) => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createClientAccount({ accountName, clientName, clientEmail, branches });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setResult(res);
    });
  }

  function reset() {
    setAccountName('');
    setClientName('');
    setClientEmail('');
    setBranches([emptyBranch()]);
    setResult(null);
    setCopied(false);
    setError(null);
  }

  if (result) {
    const loginUrl = window.location.origin + '/login';
    const message =
      'Welcome to The Fix!\n\nLogin: ' + loginUrl + '\nEmail: ' + result.email + '\nPassword: ' + result.password +
      '\n\nPlease keep this password private.';

    return (
      <div className="space-y-4 rounded-xl border-2 border-green-600/30 bg-white p-6 shadow-sm">
        <p className="text-lg font-semibold text-green-700">
          Client created: {result.accountName} ({result.branchCount} {result.branchCount === 1 ? 'branch' : 'branches'})
        </p>
        <p className="text-sm text-gray-600">
          Send these login details to the client. <strong>The password is shown only once</strong> - copy it now.
        </p>
        <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-mono text-sm text-gray-800">{message}</pre>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(message);
              setCopied(true);
            }}
            className="rounded-md bg-[#1F3864] px-4 py-2 text-sm font-semibold text-white"
          >
            {copied ? 'Copied ✓' : 'Copy message'}
          </button>
          <button type="button" onClick={reset} className="text-sm text-[#1F3864] underline">
            Create another client
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-medium text-gray-700">Business name</span>
          <input className={inputClass} value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="e.g. Cedar Coffee Co." />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-gray-700">Client contact name (optional)</span>
          <input className={inputClass} value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. Rami Khoury" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-gray-700">Client login email</span>
          <input type="email" className={inputClass} value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="owner@business.com" />
        </label>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Branches</p>
        {branches.map((b, index) => (
          <div key={index} className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 p-3 sm:grid-cols-[1fr_1fr_140px_auto]">
            <input className={inputClass} placeholder="Branch name (e.g. Hamra)" value={b.name} onChange={(e) => updateBranch(index, { name: e.target.value })} />
            <input className={inputClass} placeholder="Location (optional)" value={b.location} onChange={(e) => updateBranch(index, { location: e.target.value })} />
            <input type="number" min="0" step="0.01" className={inputClass} placeholder="Avg order $ (optional)" value={b.avgOrderValue} onChange={(e) => updateBranch(index, { avgOrderValue: e.target.value })} />
            <button
              type="button"
              onClick={() => setBranches((prev) => prev.filter((_, i) => i !== index))}
              disabled={branches.length === 1}
              className="text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30"
              aria-label="Remove branch"
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setBranches((prev) => [...prev, emptyBranch()])} className="block text-sm font-medium text-[#1F3864] hover:underline">
          + Add another branch
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={isPending} className="rounded-md bg-[#1F3864] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {isPending ? 'Creating...' : 'Create client'}
      </button>
    </form>
  );
}