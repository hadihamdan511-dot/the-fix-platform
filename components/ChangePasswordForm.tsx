'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useLang } from '@/components/LangProvider';

const inputClass = 'w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800';

export function ChangePasswordForm() {
  const lang = useLang();
  const t =
    lang === 'ar'
      ? {
          title: 'تغيير كلمة المرور',
          newPw: 'كلمة المرور الجديدة',
          confirm: 'تأكيد كلمة المرور الجديدة',
          save: 'تحديث كلمة المرور',
          saving: 'جارٍ التحديث...',
          tooShort: 'استخدم 8 أحرف على الأقل.',
          mismatch: 'كلمتا المرور غير متطابقتين.',
          success: 'تم تحديث كلمة المرور.',
        }
      : {
          title: 'Change password',
          newPw: 'New password',
          confirm: 'Confirm new password',
          save: 'Update password',
          saving: 'Updating...',
          tooShort: 'Use at least 8 characters.',
          mismatch: "The passwords don't match.",
          success: 'Password updated.',
        };

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (password.length < 8) {
      setError(t.tooShort);
      return;
    }
    if (password !== confirm) {
      setError(t.mismatch);
      return;
    }
    setSaving(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setPassword('');
    setConfirm('');
    setSuccess(true);
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#1F3864]">{t.title}</h2>
      <input
        type="password"
        dir="ltr"
        className={inputClass}
        placeholder={t.newPw}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        dir="ltr"
        className={inputClass}
        placeholder={t.confirm}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">{t.success}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-[#1F3864] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? t.saving : t.save}
      </button>
    </form>
  );
}