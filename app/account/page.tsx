import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/serverAuth';
import { getLang } from '@/lib/getLang';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const lang = await getLang();
  const t =
    lang === 'ar'
      ? { back: '→ العودة إلى لوحة التحكم', title: 'حسابي', signedInAs: 'مسجّل الدخول باسم' }
      : { back: '← Back to dashboard', title: 'My account', signedInAs: 'Signed in as' };

  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-6">
      <div>
        <Link href="/dashboard" className="text-sm text-[#1F3864] underline">
          {t.back}
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-[#1F3864]">{t.title}</h1>
        <p className="text-sm text-gray-500">
          {t.signedInAs} <span dir="ltr" className="font-medium text-gray-700">{user.email}</span>
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}