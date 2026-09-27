'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { MIN_RETENTION_ENTRIES } from '@/lib/pricingRecommendation';
import type { RetentionReason } from '@/lib/types';
import { useLang } from '@/components/LangProvider';
import { getDict } from '@/lib/dictionaries';
import { getRetentionDict } from '@/lib/dictRetention';

const REASON_VALUES: RetentionReason[] = [
  'price',
  'product_quality',
  'service_responsiveness',
  'lack_of_alternatives',
  'trust_relationship',
  'not_sure',
];

interface Row {
  customerLabel: string;
  purchaseCountEstimate: string;
  retentionReason: RetentionReason | '';
}

const emptyRow = (): Row => ({ customerLabel: '', purchaseCountEstimate: '', retentionReason: '' });

interface RetentionEntryFormProps {
  branchId: string;
  existingEntryCount: number;
}

export function RetentionEntryForm({ branchId, existingEntryCount }: RetentionEntryFormProps) {
  const router = useRouter();
  const lang = useLang();
  const reasons = getDict(lang).reasons;
  const t = getRetentionDict(lang).form;

  const rowsNeeded = Math.max(MIN_RETENTION_ENTRIES - existingEntryCount, 1);
  const [rows, setRows] = useState<Row[]>(() => Array.from({ length: rowsNeeded }, emptyRow));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const complete = rows.filter(
      (r) => r.customerLabel.trim() && r.purchaseCountEstimate.trim() && r.retentionReason
    );
    if (complete.length === 0) {
      setError(t.needRow);
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: insertError } = await supabase.from('retention_entries').insert(
        complete.map((r) => ({
          branch_id: branchId,
          customer_label: r.customerLabel.trim(),
          purchase_count_estimate: parseInt(r.purchaseCountEstimate, 10),
          retention_reason: r.retentionReason,
        }))
      );
      if (insertError) throw insertError;

      if (existingEntryCount + complete.length >= MIN_RETENTION_ENTRIES) {
        const res = await fetch('/api/recommendations/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ branchId }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? t.genFailed);
        }
      }

      setRows(Array.from({ length: rowsNeeded }, emptyRow));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[#1F3864]">{t.title}</h3>
        <p className="text-sm text-gray-600">{t.intro(MIN_RETENTION_ENTRIES)}</p>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 p-3 sm:grid-cols-[1fr_120px_1fr_auto]"
          >
            <input
              type="text"
              placeholder={t.labelPh}
              value={row.customerLabel}
              onChange={(e) => updateRow(index, { customerLabel: e.target.value })}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              min={1}
              placeholder={t.timesPh}
              value={row.purchaseCountEstimate}
              onChange={(e) => updateRow(index, { purchaseCountEstimate: e.target.value })}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
            <select
              value={row.retentionReason}
              onChange={(e) => updateRow(index, { retentionReason: e.target.value as RetentionReason })}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
            >
              <option value="">{t.reasonPh}</option>
              {REASON_VALUES.map((value) => (
                <option key={value} value={value}>
                  {reasons[value]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="text-sm text-gray-400 hover:text-gray-600"
              aria-label={t.removeRowAria}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="block text-sm font-medium text-[#1F3864] hover:underline"
      >
        {t.add}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-[#1F3864] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {submitting ? t.saving : t.save}
      </button>
    </form>
  );
}