import { useState, useEffect, useCallback } from "react";

export type Language = "it" | "ro" | "en";

export interface LanguageConfig {
  code: Language;
  name: string;
  flag: string;
}

export const LANGUAGES: Record<Language, LanguageConfig> = {
  it: { code: "it", name: "Italiano", flag: "🇮🇹" },
  ro: { code: "ro", name: "Rumeno", flag: "🇷🇴" },
  en: { code: "en", name: "English", flag: "🇬🇧" },
};

const STORAGE_KEY = "app-language";
const DEFAULT_LANGUAGE: Language = "it";

export const useLanguage = () => {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEY) as Language | null;
    const initialLanguage = savedLanguage && Object.keys(LANGUAGES).includes(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE;

    setLanguageState(initialLanguage);
    setIsLoaded(true);
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = useCallback((newLanguage: Language) => {
    if (Object.keys(LANGUAGES).includes(newLanguage)) {
      setLanguageState(newLanguage);
      localStorage.setItem(STORAGE_KEY, newLanguage);
    }
  }, []);

  const getCurrentLanguageConfig = useCallback(() => {
    return LANGUAGES[language];
  }, [language]);

  return {
    language,
    setLanguage,
    isLoaded,
    currentLanguageConfig: getCurrentLanguageConfig(),
    availableLanguages: Object.values(LANGUAGES),
  };
};
