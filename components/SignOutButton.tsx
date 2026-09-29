'use client';

import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export function SignOutButton({ lang }: { lang: 'en' | 'ar' }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button type="button" onClick={signOut} className="text-gray-500 hover:underline">
      {lang === 'ar' ? 'تسجيل الخروج' : 'Sign out'}
    </button>
  );
}