'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function LanguageSwitcher({ lang }: { lang: 'en' | 'ar' }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = lang === 'en' ? 'ar' : 'en';
    document.cookie = 'lang=' + next + '; path=/; max-age=31536000; samesite=lax';
    startTransition(() => router.refresh());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className="fixed top-4 end-4 z-50 rounded-full border border-[#1F3864] bg-white px-4 py-1.5 text-sm font-semibold text-[#1F3864] shadow-sm hover:bg-[#1F3864] hover:text-white disabled:opacity-50"
    >
      {lang === 'en' ? 'عربي' : 'English'}
    </button>
  );
}