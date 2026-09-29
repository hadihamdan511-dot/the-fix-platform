'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { resetClientPassword, setClientAccess, deleteClient } from '@/lib/actions/adminClients';

export interface ClientLogin {
  id: string;
  email: string;
  disabled: boolean;
}

export function ClientLoginRow({ login }: { login: ClientLogin }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    if (!window.confirm('Reset the password for ' + login.email + '? Their current password will stop working.')) return;
    setError(null);
    startTransition(async () => {
      const res = await resetClientPassword(login.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setMessage(
        'Your The Fix password was reset.\n\nLogin: ' + window.location.origin + '/login\nEmail: ' + res.email +
          '\nNew password: ' + res.password + '\n\nYou can change it anytime under "My account".'
      );
      setCopied(false);
    });
  }

  function toggleAccess() {
    const verb = login.disabled ? 'Enable' : 'Disable';
    if (!window.confirm(verb + ' access for ' + login.email + '?')) return;
    setError(null);
    startTransition(async () => {
      const res = await setClientAccess(login.id, login.disabled);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2 rounded-lg border border-gray-100 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-800">{login.email}</span>
          {login.disabled ? (
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">Disabled</span>
          ) : (
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-semibold text-green-700">Active</span>
          )}
        </div>
        <div className="flex gap-3 text-sm">
          <button type="button" onClick={reset} disabled={isPending} className="text-[#1F3864] hover:underline disabled:opacity-50">
            Reset password
          </button>
          <button
            type="button"
            onClick={toggleAccess}
            disabled={isPending}
            className={(login.disabled ? 'text-green-700' : 'text-amber-700') + ' hover:underline disabled:opacity-50'}
          >
            {login.disabled ? 'Enable access' : 'Disable access'}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {message && (
        <div className="space-y-2 rounded-lg border-2 border-green-600/30 bg-green-50 p-3">
          <p className="text-xs font-semibold text-green-800">New password - shown only once. Copy it now.</p>
          <pre className="whitespace-pre-wrap font-mono text-xs text-gray-800">{message}</pre>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(message);
                setCopied(true);
              }}
              className="rounded-md bg-[#1F3864] px-3 py-1.5 text-xs font-semibold text-white"
            >
              {copied ? 'Copied ✓' : 'Copy message'}
            </button>
            <button type="button" onClick={() => setMessage(null)} className="text-xs text-gray-500 hover:underline">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DeleteClientButton({ accountId, accountName }: { accountId: string; accountName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteClient(accountId, typed);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm text-red-600 hover:underline">
        Delete client
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border-2 border-red-200 bg-red-50 p-3">
      <p className="text-sm text-red-800">
        This permanently deletes <strong>{accountName}</strong>: its login, branches, customers, competitors, and
        recommendations. This cannot be undone.
      </p>
      <p className="text-xs text-red-800">
        Type <strong>{accountName}</strong> to confirm:
      </p>
      <input
        className="w-full rounded border border-red-300 bg-white px-3 py-2 text-sm"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
      />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={confirmDelete}
          disabled={isPending || typed.trim() !== accountName.trim()}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          {isPending ? 'Deleting...' : 'Delete permanently'}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setTyped('');
            setError(null);
          }}
          className="text-sm text-gray-500 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}