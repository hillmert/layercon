import { useState, useEffect } from 'react';
import { ThemeType, getTheme, CHART_THEMES } from '@/lib/chartThemes';

const STORAGE_KEY = 'chartTheme';
const DEFAULT_THEME: ThemeType = 'default';

/**
 * Hook to manage chart theme selection and persistence
 */
export function useChartTheme() {
  const [theme, setTheme] = useState<ThemeType>(DEFAULT_THEME);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in CHART_THEMES) {
      setTheme(stored as ThemeType);
    }
    setIsLoaded(true);
  }, []);

  // Save theme to localStorage when it changes
  const updateTheme = (newTheme: ThemeType) => {
    if (newTheme in CHART_THEMES) {
      setTheme(newTheme);
      localStorage.setItem(STORAGE_KEY, newTheme);
    }
  };

  return {
    theme,
    updateTheme,
    themeConfig: getTheme(theme),
    isLoaded,
  };
}

/**
 * Get the current theme from localStorage (synchronous)
 */
export function getCurrentTheme(): ThemeType {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored in CHART_THEMES) {
    return stored as ThemeType;
  }
  return DEFAULT_THEME;
}

/**
 * Set the theme in localStorage
 */
export function setChartTheme(theme: ThemeType) {
  if (theme in CHART_THEMES) {
    localStorage.setItem(STORAGE_KEY, theme);
  }
}
