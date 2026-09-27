import { en as enDict, getDict } from './dictionaries';
import { getRetentionDict } from './dictRetention';
import type { RetentionReason } from './types';

export function translateRecText(text: string, lang: 'en' | 'ar'): string {
  if (lang === 'en') return text;

  const t = getRetentionDict('ar').card.texts;

  if (text.startsWith('Your customers stay for a mix')) return t.mixed;
  if (text.startsWith('We recommend against raising prices')) return t.price;
  if (text.startsWith("Retention reasons aren't clear enough")) return t.notSure;

  const match = text.match(/^You likely have room to raise prices cautiously\. (.+?) appears to be the main reason/);
  if (match) {
    const keys = Object.keys(enDict.reasons) as RetentionReason[];
    const key = keys.find((k) => enDict.reasons[k] === match[1]);
    if (key) return t.raise(getDict('ar').reasons[key]);
  }

  return text;
}