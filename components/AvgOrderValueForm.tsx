'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateAvgOrderValue } from '@/lib/actions/retention';

interface Props {
  branchId: string;
  currentValue: number | null;
}

export function AvgOrderValueForm({ branchId, currentValue }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(currentValue != null ? String(currentValue) : '');
  const [editing, setEditing] = useState(currentValue == null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    const num = Number(value);
    if (!value || !Number.isFinite(num) || num <= 0) {
      setError('Enter a number greater than 0.');
      return;
    }
    startTransition(async () => {
      const res = await updateAvgOrderValue(branchId, num);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm font-medium text-gray-500">Average order value</p>

      {!editing ? (
        <div className="mt-1 flex items-center gap-4">
          <span className="text-xl font-semibold text-[#1F3864]">${currentValue}</span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm font-medium text-[#1F3864] underline"
          >
            Edit
          </button>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-gray-500">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-32 rounded border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g. 45"
          />
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="rounded bg-[#1F3864] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save'}
          </button>
          {currentValue != null && (
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setValue(String(currentValue));
                setError(null);
              }}
              className="text-sm text-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-gray-500">
        Changing this recalculates your pricing recommendation automatically.
      </p>
    </div>
  );
}