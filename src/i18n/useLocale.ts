import { useCallback } from 'react';
import { usePriceStore } from '../hooks/usePriceStore';
import zh from './zh';
import en from './en';
import type { TranslationKey } from './zh';

const translations = { zh, en } as const;

export function useLocale() {
  const language = usePriceStore(s => s.settings.language);
  const updateSettings = usePriceStore(s => s.updateSettings);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] ?? key;
  }, [language]);

  const setLanguage = useCallback((lang: 'zh' | 'en') => {
    updateSettings({ language: lang });
  }, [updateSettings]);

  return { t, language, setLanguage };
}
