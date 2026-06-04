import { useState, useEffect } from 'react';
import { themes, defaultTheme, applyTheme } from '../utils/theme';
import type { Theme } from '../types';

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? themes[saved] || defaultTheme : defaultTheme;
  });

  useEffect(() => {
    applyTheme(currentTheme);
    localStorage.setItem('theme', 
      Object.entries(themes).find(([_, t]) => t === currentTheme)?.[0] || 'ocean'
    );
  }, [currentTheme]);

  const setTheme = (themeName: string) => {
    const theme = themes[themeName] || defaultTheme;
    setCurrentTheme(theme);
  };

  return { currentTheme, setTheme, themes };
}
