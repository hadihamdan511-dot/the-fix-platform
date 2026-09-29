'use server';

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/serverAuth';
import { createServiceRoleClient } from '@/lib/supabase/server';

type Fail = { ok: false; error: string };

async function isAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', data.user.id).single();
  return profile?.role === 'fix_admin';
}

async function isAdminUser(userId: string) {
  const service = createServiceRoleClient();
  const { data } = await service.from('user_profiles').select('role').eq('id', userId).maybeSingle();
  return data?.role === 'fix_admin';
}

export async function resetClientPassword(
  userId: string
): Promise<{ ok: true; email: string; password: string } | Fail> {
  if (!(await isAdmin())) return { ok: false, error: 'Only The Fix team can do this.' };
  if (await isAdminUser(userId)) return { ok: false, error: 'Admin accounts cannot be changed here.' };

  const service = createServiceRoleClient();
  const password = 'Fix-' + randomBytes(9).toString('base64url') + '!';
  const { data, error } = await service.auth.admin.updateUserById(userId, { password });
  if (error || !data?.user) return { ok: false, error: error?.message ?? 'Could not reset the password.' };

  return { ok: true, email: data.user.email ?? '', password };
}

export async function setClientAccess(userId: string, enabled: boolean): Promise<{ ok: true } | Fail> {
  if (!(await isAdmin())) return { ok: false, error: 'Only The Fix team can do this.' };
  if (await isAdminUser(userId)) return { ok: false, error: 'Admin accounts cannot be changed here.' };

  const service = createServiceRoleClient();
  const { error } = await service.auth.admin.updateUserById(userId, {
    ban_duration: enabled ? 'none' : '876000h',
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/clients');
  return { ok: true };
}

export async function deleteClient(accountId: string, typedName: string): Promise<{ ok: true } | Fail> {
  if (!(await isAdmin())) return { ok: false, error: 'Only The Fix team can do this.' };

  const service = createServiceRoleClient();
  const { data: account } = await service.from('accounts').select('id, name').eq('id', accountId).single();
  if (!account) return { ok: false, error: 'Client not found.' };
  if (typedName.trim() !== account.name.trim()) {
    return { ok: false, error: 'The name you typed does not match the business name.' };
  }

  // Deletes all of the client's data in one all-or-nothing database transaction.
  const { data: userIds, error } = await service.rpc('delete_client_account', { p_account_id: accountId });
  if (error) return { ok: false, error: 'Nothing was deleted. ' + error.message };

  // Remove logins that belonged only to this client (never admins).
  for (const userId of (userIds ?? []) as string[]) {
    if (await isAdminUser(userId)) continue;
    const { count } = await service
      .from('account_users')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if ((count ?? 0) > 0) continue;
    await service.from('user_profiles').delete().eq('id', userId);
    await service.auth.admin.deleteUser(userId);
  }

  revalidatePath('/admin/clients');
  revalidatePath('/dashboard');
  return { ok: true };
}