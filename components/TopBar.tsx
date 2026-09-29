import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/serverAuth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { SignOutButton } from '@/components/SignOutButton';

export async function TopBar({ lang }: { lang: 'en' | 'ar' }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single();
    isAdmin = profile?.role === 'fix_admin';
  }

  const t = lang === 'ar' ? { account: 'حسابي', admin: 'الإدارة' } : { account: 'My account', admin: 'Admin' };

  return (
    <div className="flex w-full flex-wrap items-center justify-end gap-4 px-4 pt-4 text-sm">
      {user && (
        <>
          {isAdmin && (
            <Link href="/admin/clients" className="font-medium text-[#1F3864] hover:underline">
              {t.admin}
            </Link>
          )}
          <Link href="/account" className="text-[#1F3864] hover:underline">
            {t.account}
          </Link>
          <SignOutButton lang={lang} />
        </>
      )}
      <LanguageSwitcher lang={lang} />
    </div>
  );
}