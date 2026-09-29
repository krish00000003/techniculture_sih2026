import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getAppTheme } from '../theme/muiTheme';

const ColorModeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
  setMode: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

export function ThemeContextProvider({ children }) {
  const [mode, setModeState] = useState(() => {
    try {
      const saved = localStorage.getItem('voctrack_theme_mode');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // Ignore storage errors in restricted iframe/browser environments
    }
    return 'light';
  });

  const setMode = useCallback((newMode) => {
    if (newMode === 'light' || newMode === 'dark') {
      setModeState(newMode);
      try {
        localStorage.setItem('voctrack_theme_mode', newMode);
      } catch {
        // Ignore storage errors
      }
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setModeState((prevMode) => {
      const nextMode = prevMode === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('voctrack_theme_mode', nextMode);
      } catch {
        // Ignore storage errors
      }
      return nextMode;
    });
  }, []);

  // Listen to OS system color scheme changes if user hasn't explicitly set a preference
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      try {
        const saved = localStorage.getItem('voctrack_theme_mode');
        if (!saved) {
          setModeState(e.matches ? 'dark' : 'light');
        }
      } catch {
        // Ignore
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, []);

  useEffect(() => {
    // Keep html / body background and native UI controls synchronized with current mode
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleTheme,
      setMode,
    }),
    [mode, toggleTheme, setMode]
  );

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

