import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

// Provides dark/light mode state to the entire app (public pages + dashboards),
// persisted in memory for the session and reflected on <html class="dark">
// so Tailwind's `dark:` variants apply everywhere.
export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => {
    // Respect the user's OS-level preference on first load
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggleTheme = () => setDark((d) => !d);

  return <ThemeContext.Provider value={{ dark, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
