import React, { createContext, useContext } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  setTheme: (theme: string) => {},
  preferences: { mode: 'light', accentColor: 'bleu', density: 'normal', animations: true, sidebarCollapsed: false },
  updatePreferences: (prefs: any) => {},
  resetToDefaults: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: 'light', setTheme: () => {}, preferences: { mode: 'light', accentColor: 'bleu', density: 'normal', animations: true, sidebarCollapsed: false }, updatePreferences: () => {}, resetToDefaults: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 