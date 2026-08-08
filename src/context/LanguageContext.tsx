// this file provides a React context for managing the current language (English or Khmer) and a translation function. It is used in the app to allow users to switch languages and to translate text keys into the appropriate language.
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { en } from '@/locales/en';
import { km } from '@/locales/km';

export type Lang = 'en' | 'km';

const dictionaries: Record<Lang, Record<string, string>> = { en, km };

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: keyof typeof en) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  // The blocking script in layout.tsx already sets lang on <html>
  // before paint, so we just sync React state to whatever it landed on.
  useEffect(() => {
    const current = (document.documentElement.getAttribute('lang') as Lang) || 'en';
    setLangState(current === 'km' ? 'km' : 'en');
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    document.documentElement.setAttribute('lang', l);
    localStorage.setItem('dom_lang', l);
  };

  const toggleLang = () => setLang(lang === 'en' ? 'km' : 'en');

  const t = (key: keyof typeof en): string => {
    return dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}