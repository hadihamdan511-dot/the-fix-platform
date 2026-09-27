'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useLang } from '@/components/LangProvider';
import { getCompetitorsDict } from '@/lib/dictCompetitors';

const inputClass = 'w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-800';
const primaryButton = 'rounded-md bg-[#1F3864] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50';

export function AddCompetitorForm({ branchId }: { branchId: string }) {
  const router = useRouter();
  const t = getCompetitorsDict(useLang()).add;
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError(t.nameRequired);
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('competitors').insert({
      branch_id: branchId,
      name: name.trim(),
      notes: notes.trim() || null,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setName('');
    setNotes('');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="font-semibold text-[#1F3864]">{t.title}</h3>
      <p className="text-xs text-gray-500">{t.hint}</p>
      <input className={inputClass} placeholder={t.namePh} value={name} onChange={(e) => setName(e.target.value)} />
      <input className={inputClass} placeholder={t.notesPh} value={notes} onChange={(e) => setNotes(e.target.value)} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={saving} className={primaryButton}>
        {saving ? t.adding : t.addBtn}
      </button>
    </form>
  );
}

type EntryTarget = { kind: 'own'; branchId: string } | { kind: 'competitor'; competitorId: string };

export function LogEntryForm({ target, label }: { target: EntryTarget; label: string }) {
  const router = useRouter();
  const t = getCompetitorsDict(useLang()).log;
  const [open, setOpen] = useState(false);
  const [followers, setFollowers] = useState('');
  const [frequency, setFrequency] = useState('');
  const [note, setNote] = useState('');
  const [flagged, setFlagged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setFollowers('');
    setFrequency('');
    setNote('');
    setFlagged(false);
    setError(null);
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!followers.trim() && !frequency.trim() && !note.trim()) {
      setError(t.needOne);
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const followerCount = followers.trim() ? parseInt(followers, 10) : null;
    const { error } =
      target.kind === 'own'
        ? await supabase.from('own_social_entries').insert({
            branch_id: target.branchId,
            follower_count: followerCount,
            posting_frequency: frequency.trim() || null,
            notes: note.trim() || null,
            entered_by: user?.id ?? null,
          })
        : await supabase.from('competitor_entries').insert({
            competitor_id: target.competitorId,
            follower_count: followerCount,
            posting_frequency: frequency.trim() || null,
            price_change_note: note.trim() || null,
            is_flagged: flagged,
            entered_by: user?.id ?? null,
          });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    reset();
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-medium text-[#1F3864] hover:underline">
        {label}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          type="number"
          min={0}
          className={inputClass}
          placeholder={t.followersPh}
          value={followers}
          onChange={(e) => setFollowers(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder={t.frequencyPh}
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        />
      </div>
      <input
        className={inputClass}
        placeholder={target.kind === 'own' ? t.ownNotesPh : t.compNotesPh}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      {target.kind === 'competitor' && (
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={flagged} onChange={(e) => setFlagged(e.target.checked)} />
          {t.flag}
        </label>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving ? t.saving : t.save}
        </button>
        <button type="button" onClick={reset} className="text-sm text-gray-500 hover:underline">
          {t.cancel}
        </button>
      </div>
    </form>
  );
}

export function CopyToBranchesButton({
  name,
  notes,
  targetBranches,
}: {
  name: string;
  notes: string | null;
  targetBranches: { id: string; name: string }[];
}) {
  const router = useRouter();
  const t = getCompetitorsDict(useLang()).copy;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCopy() {
    setSaving(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('competitors').insert(
      targetBranches.map((b) => ({ branch_id: b.id, name, notes, created_by: user?.id ?? null }))
    );
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  if (targetBranches.length === 0) {
    return <span className="text-xs text-gray-400">{t.trackedAll}</span>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCopy}
        disabled={saving}
        title={targetBranches.map((b) => b.name).join(', ')}
        className="text-xs font-medium text-[#1F3864] hover:underline disabled:opacity-50"
      >
        {saving ? t.copying : t.copyTo(targetBranches.length)}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}