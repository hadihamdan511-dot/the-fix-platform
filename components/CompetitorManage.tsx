'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useLang } from '@/components/LangProvider';
import { getManageDict } from '@/lib/dictCompetitorsManage';

const inputClass = 'w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-800';

export function CompetitorHeader({ id, name, notes }: { id: string; name: string; notes: string | null }) {
  const router = useRouter();
  const t = getManageDict(useLang());
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const [newNotes, setNewNotes] = useState(notes ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!newName.trim()) {
      setError(t.nameRequired);
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from('competitors')
      .update({ name: newName.trim(), notes: newNotes.trim() || null })
      .eq('id', id);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(t.confirmDelete(name))) return;
    setBusy(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from('competitors').delete().eq('id', id);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  if (editing) {
    return (
      <div className="w-full space-y-2">
        <input className={inputClass} placeholder={t.namePh} value={newName} onChange={(e) => setNewName(e.target.value)} />
        <input className={inputClass} placeholder={t.notesPh} value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="rounded-md bg-[#1F3864] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? t.saving : t.save}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setNewName(name);
              setNewNotes(notes ?? '');
              setError(null);
            }}
            className="text-sm text-gray-500 hover:underline"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="font-semibold text-gray-800">{name}</p>
      {notes && <p className="text-xs text-gray-500">{notes}</p>}
      <div className="mt-1 flex gap-3 text-xs">
        <button type="button" onClick={() => setEditing(true)} className="text-[#1F3864] hover:underline">
          {t.edit}
        </button>
        <button type="button" onClick={remove} disabled={busy} className="text-red-600 hover:underline disabled:opacity-50">
          {t.delete}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export interface EntryRow {
  id: string;
  entry_date: string | null;
  follower_count: number | null;
  posting_frequency: string | null;
  price_change_note: string | null;
  is_flagged: boolean;
}

export function EntryHistory({ entries }: { entries: EntryRow[] }) {
  const router = useRouter();
  const lang = useLang();
  const t = getManageDict(lang);
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (entries.length === 0) return null;

  function fmtDate(iso: string | null) {
    if (!iso) return '-';
    const locale = lang === 'ar' ? 'ar-LB-u-nu-latn' : 'en-GB';
    return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  async function remove(id: string) {
    if (!window.confirm(t.confirmDeleteEntry)) return;
    setDeletingId(id);
    setError(null);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from('competitor_entries').delete().eq('id', id);
    setDeletingId(null);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-3">
      <button type="button" onClick={() => setOpen((v) => !v)} className="text-xs font-medium text-gray-500 hover:underline">
        {open ? t.hideHistory : t.history(entries.length)}
      </button>
      {open && (
        <ul className="mt-2 divide-y divide-gray-100 rounded border border-gray-100 text-xs text-gray-700">
          {entries.map((e) => (
            <li key={e.id} className="flex items-start justify-between gap-3 px-3 py-2">
              <div className="space-y-0.5">
                <p className="text-gray-500">
                  {fmtDate(e.entry_date)}
                  {e.is_flagged && (
                    <span className="ms-2 rounded bg-[#BF8F00]/15 px-1 py-0.5 font-semibold text-[#BF8F00]">{t.flagged}</span>
                  )}
                </p>
                <p>
                  {e.follower_count != null && (
                    <span className="me-3">
                      {e.follower_count.toLocaleString('en-US')} {t.followers}
                    </span>
                  )}
                  {e.posting_frequency && <span className="me-3">{e.posting_frequency}</span>}
                </p>
                {e.price_change_note && <p dir="auto">{e.price_change_note}</p>}
              </div>
              <button
                type="button"
                onClick={() => remove(e.id)}
                disabled={deletingId === e.id}
                className="shrink-0 text-red-600 hover:underline disabled:opacity-50"
              >
                {t.delete}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}