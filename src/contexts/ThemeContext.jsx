import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

// Available color themes with modern palettes
export const COLOR_THEMES = {
  emerald: {
    name: 'Emerald',
    light: '160 84% 39%',   // emerald-600
    dark: '160 84% 52%',     // emerald-500
  },
  violet: {
    name: 'Violet',
    light: '262 83% 58%',    // violet-500
    dark: '258 90% 66%',     // violet-400
  },
  rose: {
    name: 'Rose',
    light: '347 77% 50%',    // rose-500
    dark: '351 83% 62%',     // rose-400
  },
  amber: {
    name: 'Amber',
    light: '32 95% 44%',     // amber-600
    dark: '38 92% 50%',      // amber-500
  },
  sky: {
    name: 'Sky',
    light: '199 89% 48%',    // sky-500
    dark: '200 98% 60%',     // sky-400
  },
  slate: {
    name: 'Slate',
    light: '215 25% 27%',    // slate-700
    dark: '217 33% 55%',     // slate-400
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has previously set a preference
    const savedTheme = localStorage.getItem('theme');
    // Check system preference
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;

    return savedTheme === 'dark' || (!savedTheme && systemPreference);
  });

  const [colorTheme, setColorTheme] = useState(() => {
    return localStorage.getItem('colorTheme') || 'emerald';
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const changeColorTheme = (theme) => {
    if (COLOR_THEMES[theme]) {
      setColorTheme(theme);
    }
  };

  useEffect(() => {
    // Update localStorage and apply class to document
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Update color theme
    localStorage.setItem('colorTheme', colorTheme);
    const theme = COLOR_THEMES[colorTheme];
    const primaryColor = isDarkMode ? theme.dark : theme.light;

    // Update CSS variable
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--ring', primaryColor);
  }, [colorTheme, isDarkMode]);

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      toggleDarkMode,
      colorTheme,
      changeColorTheme,
      availableThemes: COLOR_THEMES
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);