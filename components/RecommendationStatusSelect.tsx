'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import type { RecommendationStatus } from '@/lib/types';
import { useLang } from '@/components/LangProvider';
import { getRecommendationsDict } from '@/lib/dictRecommendations';

const STATUS_VALUES: RecommendationStatus[] = ['not_started', 'in_progress', 'implemented', 'deferred'];

export function RecommendationStatusSelect({
  id,
  initialStatus,
}: {
  id: string;
  initialStatus: RecommendationStatus;
}) {
  const router = useRouter();
  const t = getRecommendationsDict(useLang());
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: RecommendationStatus) {
    const previous = status;
    setStatus(next);
    setSaving(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('recommendation_log')
      .update({ status: next, updated_by: user?.id ?? null })
      .eq('id', id);
    setSaving(false);
    if (error) {
      setStatus(previous);
      setError(t.couldNotSave);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        value={status}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value as RecommendationStatus)}
        className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-800 disabled:opacity-50"
      >
        {STATUS_VALUES.map((value) => (
          <option key={value} value={value}>
            {t.statuses[value]}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}