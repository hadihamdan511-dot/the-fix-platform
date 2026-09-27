'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useDict } from '@/components/LangProvider';

export default function LoginPage() {
  const router = useRouter();
  const t = useDict().login;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message.includes('Invalid login credentials') ? t.invalid : error.message);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="mx-auto mt-24 w-full max-w-sm space-y-4 p-6">
      <h1 className="text-2xl font-bold text-[#1F3864]">{t.title}</h1>
      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          placeholder={t.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          dir={email ? 'ltr' : undefined}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="password"
          placeholder={t.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          dir={password ? 'ltr' : undefined}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[#1F3864] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? t.signingIn : t.signIn}
        </button>
      </form>
    </div>
  );
}