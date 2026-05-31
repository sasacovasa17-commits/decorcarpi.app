/**
 * useTheme Hook - Dark Mode Toggle with localStorage persistence
 */

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get theme from localStorage or system preference
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) return stored;

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  useEffect(() => {
    // Update DOM and localStorage
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('theme', theme);

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setDarkMode = () => setTheme('dark');
  const setLightMode = () => setTheme('light');

  return {
    theme,
    toggleTheme,
    setDarkMode,
    setLightMode,
    isDark: theme === 'dark',
  };
}
