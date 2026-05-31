import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
export type ThemeId = 'minimal' | 'warm' | 'cool' | 'dark';

export interface ThemeColors {
  bg: string;
  accent: string;
  gold: string;
}

export interface ColorTheme {
  id: ThemeId;
  name: string;
  colors: ThemeColors;
  desc: string;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  switchable: boolean;
  selectedColorTheme: ThemeId;
  setSelectedColorTheme: (theme: ThemeId) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  currentColorTheme: ColorTheme;
  colorThemes: ColorTheme[];
}

const COLOR_THEMES: ColorTheme[] = [
  { id: 'minimal', name: 'Minimal', colors: { bg: '#f5f5f5', accent: '#333', gold: '#d4af37' }, desc: 'Bianco e nero puro' },
  { id: 'warm', name: 'Warm', colors: { bg: '#fff8f0', accent: '#8b4513', gold: '#d4a574' }, desc: 'Tonalità calde e terrene' },
  { id: 'cool', name: 'Cool', colors: { bg: '#f0f8ff', accent: '#1e3a8a', gold: '#60a5fa' }, desc: 'Blu e tonalità fredde' },
  { id: 'dark', name: 'Dark', colors: { bg: '#0a0a0a', accent: '#e8e8e8', gold: '#c9a227' }, desc: 'Nero e oro lussuoso' },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const [selectedColorTheme, setSelectedColorTheme] = useState<ThemeId>(() => {
    const stored = localStorage.getItem("colorTheme");
    return (stored as ThemeId) || 'dark';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem("darkMode");
    return stored !== null ? JSON.parse(stored) : true;
  });

  // Force re-render when custom colors change
  const [colorUpdateTrigger, setColorUpdateTrigger] = useState(0);

  // Get custom colors from localStorage
  const getCustomColors = () => {
    const customBg = localStorage.getItem('customBgColor');
    const customAccent = localStorage.getItem('customAccentColor');
    const customGold = localStorage.getItem('customGoldColor');
    return { customBg, customAccent, customGold };
  };

  let currentColorTheme = COLOR_THEMES.find((t) => t.id === selectedColorTheme) || COLOR_THEMES[3];
  
  // Apply custom colors if they exist
  const { customBg, customAccent, customGold } = getCustomColors();
  if (customBg || customAccent || customGold) {
    currentColorTheme = {
      ...currentColorTheme,
      colors: {
        bg: customBg || currentColorTheme.colors.bg,
        accent: customAccent || currentColorTheme.colors.accent,
        gold: customGold || currentColorTheme.colors.gold,
      }
    };
  }

  // Applica tema al root element e custom colors
  useEffect(() => {
    const root = document.documentElement;
    const { customBg, customAccent, customGold } = getCustomColors();
    
    const theme = COLOR_THEMES.find((t) => t.id === selectedColorTheme) || COLOR_THEMES[3];
    root.style.setProperty('--theme-bg', customBg || theme.colors.bg);
    root.style.setProperty('--theme-accent', customAccent || theme.colors.accent);
    root.style.setProperty('--theme-gold', customGold || theme.colors.gold);
    
    // Salva in localStorage
    localStorage.setItem('colorTheme', selectedColorTheme);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [selectedColorTheme, darkMode, colorUpdateTrigger]);
  
  // Listen for custom color changes
  useEffect(() => {
    const handleStorageChange = () => {
      const root = document.documentElement;
      const { customBg, customAccent, customGold } = getCustomColors();
      const theme = COLOR_THEMES.find((t) => t.id === selectedColorTheme) || COLOR_THEMES[3];
      
      if (customBg) root.style.setProperty('--theme-bg', customBg);
      if (customAccent) root.style.setProperty('--theme-accent', customAccent);
      if (customGold) root.style.setProperty('--theme-gold', customGold);
      
      // Force re-render
      setColorUpdateTrigger(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedColorTheme]);

  // Listen for localStorage changes within the same tab
  useEffect(() => {
    const interval = setInterval(() => {
      const customBg = localStorage.getItem('customBgColor');
      const customAccent = localStorage.getItem('customAccentColor');
      const customGold = localStorage.getItem('customGoldColor');
      
      if (customBg || customAccent || customGold) {
        setColorUpdateTrigger(prev => prev + 1);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  const toggleTheme = switchable
    ? () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
      }
    : undefined;

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      switchable,
      selectedColorTheme,
      setSelectedColorTheme,
      darkMode,
      setDarkMode,
      currentColorTheme,
      colorThemes: COLOR_THEMES,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
