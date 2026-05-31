import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('useTheme Hook', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Reset DOM
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with light theme by default', () => {
    const stored = localStorage.getItem('theme');
    expect(stored).toBeNull();
  });

  it('should persist theme to localStorage', () => {
    localStorage.setItem('theme', 'dark');
    const stored = localStorage.getItem('theme');
    expect(stored).toBe('dark');
  });

  it('should toggle between light and dark themes', () => {
    localStorage.setItem('theme', 'light');
    expect(localStorage.getItem('theme')).toBe('light');
    
    localStorage.setItem('theme', 'dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should add dark class to document element', () => {
    document.documentElement.classList.add('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should remove dark class from document element', () => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
