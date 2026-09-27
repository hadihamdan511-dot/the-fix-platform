'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteRetentionEntry } from '@/lib/actions/retention';
import type { RetentionReason } from '@/lib/types';
import { useLang } from '@/components/LangProvider';
import { getDict } from '@/lib/dictionaries';
import { getRetentionDict } from '@/lib/dictRetention';

export interface RetentionEntryRow {
  id: string;
  customer_label: string;
  purchase_count_estimate: number;
  retention_reason: RetentionReason;
}

interface Props {
  branchId: string;
  entries: RetentionEntryRow[];
}

export function RetentionEntryList({ branchId, entries }: Props) {
  const router = useRouter();
  const lang = useLang();
  const reasons = getDict(lang).reasons;
  const t = getRetentionDict(lang).list;
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (entries.length === 0) return null;

  function remove(entry: RetentionEntryRow) {
    if (!window.confirm(t.confirm(entry.customer_label))) return;
    setError(null);
    setDeletingId(entry.id);
    startTransition(async () => {
      const res = await deleteRetentionEntry(branchId, entry.id);
      setDeletingId(null);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#1F3864]">{t.title(entries.length)}</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-start text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2 text-start">{t.customer}</th>
              <th className="px-4 py-2 text-start">{t.times}</th>
              <th className="px-4 py-2 text-start">{t.why}</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t border-gray-100">
                <td className="px-4 py-2">{entry.customer_label}</td>
                <td className="px-4 py-2">{entry.purchase_count_estimate}</td>
                <td className="px-4 py-2">{reasons[entry.retention_reason]}</td>
                <td className="px-4 py-2 text-end">
                  <button
                    type="button"
                    onClick={() => remove(entry)}
                    disabled={isPending}
                    className="text-sm text-red-600 disabled:opacity-50"
                  >
                    {deletingId === entry.id ? t.removing : t.remove}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}