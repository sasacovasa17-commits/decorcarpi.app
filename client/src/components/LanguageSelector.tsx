import { useLanguage, LANGUAGES } from "@/hooks/useLanguage";
import { Check } from "lucide-react";

interface LanguageSelectorProps {
  isDark?: boolean;
}

export function LanguageSelector({ isDark = true }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold" style={{ color: isDark ? "#e8e8e8" : "#333" }}>
        Lingua / Language / Limbă
      </h3>

      <div className="grid grid-cols-3 gap-2">
        {Object.values(LANGUAGES).map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2"
            style={{
              borderColor: language === lang.code ? "#c9a227" : "rgba(201,162,39,0.2)",
              background: language === lang.code ? "rgba(201,162,39,0.1)" : isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            }}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span className="text-xs font-medium" style={{ color: isDark ? "#e8e8e8" : "#333" }}>
              {lang.name}
            </span>
            {language === lang.code && <Check size={14} style={{ color: "#c9a227" }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
