'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { MIN_RETENTION_ENTRIES } from '@/lib/pricingRecommendation';
import type { RetentionReason } from '@/lib/types';

const REASON_OPTIONS: { value: RetentionReason; label: string }[] = [
  { value: 'price', label: 'Price' },
  { value: 'product_quality', label: 'Product quality' },
  { value: 'service_responsiveness', label: 'Service & responsiveness' },
  { value: 'lack_of_alternatives', label: 'Lack of market alternatives' },
  { value: 'trust_relationship', label: 'Trust & relationship' },
  { value: 'not_sure', label: 'Not sure' },
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
  const rowsNeeded = Math.max(MIN_RETENTION_ENTRIES - existingEntryCount, 1);
  const [rows, setRows] = useState<Row[]>(() => Array.from({ length: rowsNeeded }, emptyRow));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }
  function addRow() { setRows((prev) => [...prev, emptyRow()]); }
  function removeRow(index: number) { setRows((prev) => prev.filter((_, i) => i !== index)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const complete = rows.filter((r) => r.customerLabel.trim() && r.purchaseCountEstimate.trim() && r.retentionReason);
    if (complete.length === 0) { setError('Fill in at least one complete row before saving.'); return; }

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
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ branchId }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Could not generate a recommendation.');
        }
      }
      setRows(Array.from({ length: rowsNeeded }, emptyRow));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong saving these entries.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[#1F3864]">Repeat customers</h3>
        <p className="text-sm text-gray-600">
          Add at least {MIN_RETENTION_ENTRIES} repeat customers total. For each one, your best guess at why
          they keep buying is what matters most — exact numbers aren&apos;t necessary.
        </p>
      </div>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 p-3 sm:grid-cols-[1fr_120px_1fr_auto]">
            <input type="text" placeholder="Customer label (e.g. Customer A)" value={row.customerLabel}
              onChange={(e) => updateRow(index, { customerLabel: e.target.value })}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm" />
            <input type="number" min={1} placeholder="Times purchased" value={row.purchaseCountEstimate}
              onChange={(e) => updateRow(index, { purchaseCountEstimate: e.target.value })}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm" />
            <select value={row.retentionReason}
              onChange={(e) => updateRow(index, { retentionReason: e.target.value as RetentionReason })}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm">
              <option value="">Why do they keep buying?</option>
              {REASON_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
            <button type="button" onClick={() => removeRow(index)} className="text-sm text-gray-400 hover:text-gray-600" aria-label="Remove row">✕</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addRow} className="text-sm font-medium text-[#1F3864] hover:underline">+ Add another customer</button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={submitting} className="rounded-md bg-[#1F3864] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {submitting ? 'Saving…' : 'Save and calculate'}
      </button>
    </form>
  );
}