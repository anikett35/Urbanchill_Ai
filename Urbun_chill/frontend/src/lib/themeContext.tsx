'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleTheme: () => {},
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('urbanchill_theme') as ThemeMode | null;
    if (saved === 'light' || saved === 'dark') {
      setModeState(saved);
      applyTheme(saved);
    } else {
      applyTheme('dark');
    }
  }, []);

  const applyTheme = (newMode: ThemeMode) => {
    const root = document.documentElement;
    if (newMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setModeState(next);
    localStorage.setItem('urbanchill_theme', next);
    applyTheme(next);
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('urbanchill_theme', newMode);
    applyTheme(newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
