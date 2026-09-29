'use server';

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/serverAuth';
import { createServiceRoleClient } from '@/lib/supabase/server';

export interface NewBranchInput {
  name: string;
  location: string;
  avgOrderValue: string;
}

export interface NewClientInput {
  accountName: string;
  clientName: string;
  clientEmail: string;
  branches: NewBranchInput[];
}

export type NewClientResult =
  | { ok: true; email: string; password: string; accountName: string; branchCount: number }
  | { ok: false; error: string };

function generatePassword() {
  return 'Fix-' + randomBytes(9).toString('base64url') + '!';
}

async function isAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', data.user.id).single();
  return profile?.role === 'fix_admin';
}

export async function createClientAccount(input: NewClientInput): Promise<NewClientResult> {
  if (!(await isAdmin())) return { ok: false, error: 'Only The Fix team can create clients.' };

  const accountName = input.accountName.trim();
  const clientName = input.clientName.trim();
  const email = input.clientEmail.trim().toLowerCase();
  const branches = input.branches
    .map((b) => ({ name: b.name.trim(), location: b.location.trim(), aov: b.avgOrderValue.trim() }))
    .filter((b) => b.name);

  if (!accountName) return { ok: false, error: 'Enter the business name.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Enter a valid client email.' };
  if (branches.length === 0) return { ok: false, error: 'Add at least one branch.' };
  for (const b of branches) {
    if (b.aov && (!Number.isFinite(Number(b.aov)) || Number(b.aov) <= 0)) {
      return { ok: false, error: 'Average order value for "' + b.name + '" must be a number greater than 0.' };
    }
  }

  const service = createServiceRoleClient();
  const password = generatePassword();

  const { data: created, error: userError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: clientName || null },
  });
  if (userError || !created?.user) {
    return { ok: false, error: userError?.message ?? 'Could not create the client login.' };
  }

  const userId = created.user.id;
  let accountId: string | null = null;

  try {
    const { error: profileError } = await service
      .from('user_profiles')
      .upsert({ id: userId, full_name: clientName || null, role: 'client_owner' });
    if (profileError) throw profileError;

    const { data: account, error: accountError } = await service
      .from('accounts')
      .insert({ name: accountName })
      .select('id')
      .single();
    if (accountError || !account) throw accountError ?? new Error('Could not create the account.');
    accountId = account.id;

    const { error: branchError } = await service.from('branches').insert(
      branches.map((b) => ({
        account_id: accountId,
        name: b.name,
        location: b.location || null,
        avg_order_value: b.aov ? Number(b.aov) : null,
      }))
    );
    if (branchError) throw branchError;

    const { error: linkError } = await service.from('account_users').insert({ account_id: accountId, user_id: userId });
    if (linkError) throw linkError;
  } catch (err) {
    // Undo everything so there are never half-created clients.
    if (accountId) {
      await service.from('account_users').delete().eq('account_id', accountId);
      await service.from('branches').delete().eq('account_id', accountId);
      await service.from('accounts').delete().eq('id', accountId);
    }
    await service.from('user_profiles').delete().eq('id', userId);
    await service.auth.admin.deleteUser(userId);
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return { ok: false, error: 'Nothing was created. ' + message };
  }

  revalidatePath('/dashboard');
  return { ok: true, email, password, accountName, branchCount: branches.length };
}