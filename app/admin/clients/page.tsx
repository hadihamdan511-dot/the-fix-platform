import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/serverAuth';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { ClientLoginRow, DeleteClientButton, type ClientLogin } from '@/components/AdminClientActions';

export default async function AdminClientsPage() {
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

  const service = createServiceRoleClient();
  const [{ data: accounts }, { data: branches }, { data: links }, { data: userList }] = await Promise.all([
    service.from('accounts').select('id, name, created_at').order('name'),
    service.from('branches').select('account_id, name').order('name'),
    service.from('account_users').select('account_id, user_id'),
    service.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const now = Date.now();
  const usersById = new Map<string, ClientLogin>();
  for (const u of userList?.users ?? []) {
    const bannedUntil = (u as { banned_until?: string | null }).banned_until;
    usersById.set(u.id, {
      id: u.id,
      email: u.email ?? '(no email)',
      disabled: Boolean(bannedUntil && new Date(bannedUntil).getTime() > now),
    });
  }

  return (
    <div dir="ltr" className="mx-auto w-full max-w-3xl space-y-8 p-6 text-left">
      <div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/dashboard" className="text-[#1F3864] underline">← Dashboard</Link>
          <Link href="/admin/clients/new" className="text-[#1F3864] underline">+ New client</Link>
          <Link href="/admin/recommendations" className="text-[#1F3864] underline">Log a recommendation</Link>
        </div>
        <p className="mt-3 text-sm font-medium text-gray-500">The Fix team</p>
        <h1 className="text-2xl font-bold text-[#1F3864]">Clients ({accounts?.length ?? 0})</h1>
        <p className="text-sm text-gray-500">
          Passwords are never visible. Use Reset password to give a client a new one.
        </p>
      </div>

      {(accounts ?? []).length === 0 && <p className="text-sm text-gray-500">No clients yet.</p>}

      <div className="space-y-4">
        {(accounts ?? []).map((account) => {
          const accountBranches = (branches ?? []).filter((b) => b.account_id === account.id);
          const logins = (links ?? [])
            .filter((l) => l.account_id === account.id)
            .map((l) => usersById.get(l.user_id))
            .filter((u): u is ClientLogin => Boolean(u));

          return (
            <div key={account.id} className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-lg font-semibold text-[#1F3864]">{account.name}</p>
                <p className="text-xs text-gray-500">
                  {accountBranches.length} {accountBranches.length === 1 ? 'branch' : 'branches'}
                  {accountBranches.length > 0 && ': ' + accountBranches.map((b) => b.name).join(', ')}
                </p>
              </div>

              {logins.length === 0 ? (
                <p className="text-sm text-gray-500">No login linked.</p>
              ) : (
                <div className="space-y-2">
                  {logins.map((login) => (
                    <ClientLoginRow key={login.id} login={login} />
                  ))}
                </div>
              )}

              <DeleteClientButton accountId={account.id} accountName={account.name} />
            </div>
          );
        })}
      </div>
    </div>
  );
}