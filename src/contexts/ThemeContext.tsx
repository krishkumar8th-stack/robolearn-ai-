import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from '../types/index';

interface ThemeContextType {
  theme: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getSystemTheme = (): 'light' | 'dark' =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('roblearn_theme') as ThemeMode | null;
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'light';
};

const resolveTheme = (mode: ThemeMode): 'light' | 'dark' =>
  mode === 'system' ? getSystemTheme() : mode;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => resolveTheme(getInitialTheme()));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const applyTheme = () => {
      const activeTheme = resolveTheme(theme);
      setEffectiveTheme(activeTheme);
      root.style.colorScheme = activeTheme;
      root.classList.toggle('dark', activeTheme === 'dark');
      root.classList.toggle('light', activeTheme === 'light');
    };

    localStorage.setItem('roblearn_theme', theme);
    applyTheme();

    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme();
    mediaQuery.addEventListener?.('change', handleChange);

    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => setThemeState(mode);

  const toggleTheme = () => {
    setThemeState((prev) => (resolveTheme(prev) === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        effectiveTheme,
        isDark: effectiveTheme === 'dark',
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
