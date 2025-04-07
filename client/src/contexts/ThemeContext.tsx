import React, { createContext, useState, useEffect, useContext } from 'react';

type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // On mount, read the preference from localStorage and set the theme
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      // If we have a saved preference, use it
      setDarkMode(savedTheme === 'dark');
    } else {
      // Otherwise, use system preference
      const systemDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      setDarkMode(systemDark);
      localStorage.setItem('theme', systemDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    // When darkMode changes, update the document class
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
