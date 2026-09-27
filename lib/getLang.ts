import { cookies } from 'next/headers';

export type Lang = 'en' | 'ar';

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return store.get('lang')?.value === 'ar' ? 'ar' : 'en';
}