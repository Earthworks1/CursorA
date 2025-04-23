import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type AccentColor = 'bleu' | 'vert' | 'orange' | 'violet';
type DensityMode = 'confortable' | 'compact' | 'standard';

interface ThemePreferences {
  mode: ThemeMode;
  accentColor: AccentColor;
  density: DensityMode;
  sidebarCollapsed: boolean;
  animations: boolean;
}

interface ThemeContextType {
  preferences: ThemePreferences;
  updatePreferences: (prefs: Partial<ThemePreferences>) => void;
  resetToDefaults: () => void;
  isCurrentlyDark: boolean;
}

// Valeurs par défaut
const defaultPreferences: ThemePreferences = {
  mode: 'system',
  accentColor: 'bleu',
  density: 'standard',
  sidebarCollapsed: false,
  animations: true
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Récupérer les préférences du stockage local ou utiliser les valeurs par défaut
  const [preferences, setPreferences] = useState<ThemePreferences>(() => {
    const savedPrefs = localStorage.getItem('themePreferences');
    return savedPrefs ? JSON.parse(savedPrefs) : defaultPreferences;
  });
  
  // Détermine si le thème actuel est sombre
  const [isCurrentlyDark, setIsCurrentlyDark] = useState<boolean>(false);
  
  // Mettre à jour les préférences
  const updatePreferences = (prefs: Partial<ThemePreferences>) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, ...prefs };
      localStorage.setItem('themePreferences', JSON.stringify(newPrefs));
      return newPrefs;
    });
  };
  
  // Réinitialiser aux valeurs par défaut
  const resetToDefaults = () => {
    localStorage.removeItem('themePreferences');
    setPreferences(defaultPreferences);
  };
  
  // Appliquer les classes CSS en fonction du thème
  useEffect(() => {
    const root = document.documentElement;
    
    // Gestion du mode (clair/sombre/système)
    const applyTheme = (dark: boolean) => {
      setIsCurrentlyDark(dark);
      if (dark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };
    
    if (preferences.mode === 'dark') {
      applyTheme(true);
    } else if (preferences.mode === 'light') {
      applyTheme(false);
    } else if (preferences.mode === 'system') {
      // Utiliser le thème du système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark);
      
      // Écouter les changements de préférence du système
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [preferences.mode]);
  
  // Appliquer la couleur d'accent
  useEffect(() => {
    const root = document.documentElement;
    
    // Supprimer toutes les classes d'accent précédentes
    root.classList.remove('accent-bleu', 'accent-vert', 'accent-orange', 'accent-violet');
    
    // Ajouter la nouvelle classe d'accent
    root.classList.add(`accent-${preferences.accentColor}`);
  }, [preferences.accentColor]);
  
  // Appliquer la densité
  useEffect(() => {
    const root = document.documentElement;
    
    // Supprimer toutes les classes de densité précédentes
    root.classList.remove('density-compact', 'density-standard', 'density-confortable');
    
    // Ajouter la nouvelle classe de densité
    root.classList.add(`density-${preferences.density}`);
  }, [preferences.density]);
  
  // Appliquer les animations
  useEffect(() => {
    const root = document.documentElement;
    
    if (preferences.animations) {
      root.classList.remove('reduce-motion');
    } else {
      root.classList.add('reduce-motion');
    }
  }, [preferences.animations]);
  
  // Appliquer l'état de la barre latérale
  useEffect(() => {
    const root = document.documentElement;
    
    if (preferences.sidebarCollapsed) {
      root.classList.add('sidebar-collapsed');
    } else {
      root.classList.remove('sidebar-collapsed');
    }
  }, [preferences.sidebarCollapsed]);
  
  return (
    <ThemeContext.Provider value={{ 
      preferences, 
      updatePreferences, 
      resetToDefaults,
      isCurrentlyDark 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}