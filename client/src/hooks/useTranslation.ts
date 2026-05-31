import { Language, translations, LANGUAGES } from "@/lib/i18n";

const DEFAULT_LANG: Language = "it";

export function useTranslation() {
  // Lingua fissa: solo italiano
  const lang = DEFAULT_LANG;
  
  // setLang è una no-op poiché la lingua è fissa
  const setLang = () => {};

  const t = translations[lang];
  const languages = LANGUAGES;

  return { t, lang, setLang, languages };
}
