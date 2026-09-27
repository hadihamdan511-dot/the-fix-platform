'use client';

import { createContext, useContext } from 'react';
import { getDict, type Dict } from '@/lib/dictionaries';

type Lang = 'en' | 'ar';

const LangContext = createContext<Lang>('en');

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang(): Lang {
  return useContext(LangContext);
}

export function useDict(): Dict {
  return getDict(useContext(LangContext));
}