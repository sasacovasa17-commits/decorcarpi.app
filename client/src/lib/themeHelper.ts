/**
 * Theme Helper - Funcții pentru aplicare tema pe toate componentele
 */

export interface ThemeColors {
  bg: string;
  accent: string;
  gold: string;
}

export const getThemeStyles = (theme: ThemeColors) => ({
  // Main container
  container: {
    background: theme.bg,
    color: theme.accent,
  },
  
  // Header/Navigation
  header: {
    background: theme.bg,
    borderColor: `${theme.gold}40`,
  },
  
  // Buttons
  primaryButton: {
    background: theme.gold,
    color: theme.bg,
  },
  
  secondaryButton: {
    background: `${theme.gold}20`,
    color: theme.gold,
    border: `1px solid ${theme.gold}40`,
  },
  
  // Cards/Sections
  card: {
    background: `${theme.gold}08`,
    border: `1px solid ${theme.gold}20`,
    borderColor: `${theme.gold}20`,
  },
  
  // Text
  title: {
    color: theme.gold,
  },
  
  subtitle: {
    color: theme.accent,
  },
  
  muted: {
    color: theme.accent,
    opacity: 0.6,
  },
  
  // Divider
  divider: {
    background: `linear-gradient(90deg, transparent, ${theme.gold}, transparent)`,
    opacity: 0.4,
  },
  
  // Input/Form
  input: {
    background: `${theme.gold}08`,
    border: `1px solid ${theme.gold}20`,
    color: theme.accent,
  },
  
  // Hover states
  hoverBg: `${theme.gold}15`,
  activeBg: `${theme.gold}26`,
});

export const applyThemeToElement = (element: HTMLElement | null, theme: ThemeColors) => {
  if (!element) return;
  
  // Apply CSS variables to element
  element.style.setProperty('--theme-bg', theme.bg);
  element.style.setProperty('--theme-accent', theme.accent);
  element.style.setProperty('--theme-gold', theme.gold);
};

export const applyThemeGlobally = (theme: ThemeColors) => {
  // Apply to root element
  const root = document.documentElement;
  root.style.setProperty('--theme-bg', theme.bg);
  root.style.setProperty('--theme-accent', theme.accent);
  root.style.setProperty('--theme-gold', theme.gold);
};
