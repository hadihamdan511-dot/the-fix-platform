import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/serverAuth';
import { NewClientForm } from '@/components/NewClientForm';

export default async function NewClientPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'fix_admin') {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-gray-600">This page is for The Fix team only.</p>
        <Link href="/dashboard" className="mt-3 inline-block text-sm text-[#1F3864] underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div dir="ltr" className="mx-auto w-full max-w-3xl space-y-8 p-6 text-left">
      <div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/dashboard" className="text-[#1F3864] underline">← Dashboard</Link>
          <Link href="/admin/recommendations" className="text-[#1F3864] underline">Log a recommendation</Link>
        </div>
        <p className="mt-3 text-sm font-medium text-gray-500">The Fix team</p>
        <h1 className="text-2xl font-bold text-[#1F3864]">New client</h1>
        <p className="text-sm text-gray-500">
          Creates the client&apos;s login, business account, and branches in one step. The client can add repeat customers and competitors after logging in.
        </p>
      </div>

      <NewClientForm />
    </div>
  );
}