/**
 * ThemeToggle Component - Dark/Light Mode Switcher
 */

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="rounded-full hover:bg-accent"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-amber-600" />
      ) : (
        <Sun className="h-5 w-5 text-amber-400" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
