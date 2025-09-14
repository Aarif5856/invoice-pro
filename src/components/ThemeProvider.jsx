import React, { createContext, useContext, useState, useEffect } from 'react';
import './ThemeProvider.css';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const themes = {
  light: {
    name: 'Light',
    icon: '☀️',
    colors: {
      background: '#ffffff',
      foreground: '#0f172a',
      primary: '#0ea5e9',
      secondary: '#64748b',
      muted: '#f8fafc',
      accent: '#0284c7',
      border: '#e2e8f0',
      input: '#ffffff',
      card: '#ffffff',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    }
  },
  dark: {
    name: 'Dark',
    icon: '🌙',
    colors: {
      background: '#0f172a',
      foreground: '#f8fafc',
      primary: '#38bdf8',
      secondary: '#94a3b8',
      muted: '#1e293b',
      accent: '#0ea5e9',
      border: '#334155',
      input: '#1e293b',
      card: '#1e293b',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
    }
  },
  system: {
    name: 'System',
    icon: '💻',
    colors: null // Will use system preference
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('system');
  const [systemTheme, setSystemTheme] = useState('light');

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }

    // Detect system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Apply theme to document
    const effectiveTheme = currentTheme === 'system' ? systemTheme : currentTheme;
    const themeConfig = themes[effectiveTheme];
    
    if (themeConfig?.colors) {
      const root = document.documentElement;
      Object.entries(themeConfig.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
      root.setAttribute('data-theme', effectiveTheme);
    }

    // Save theme to localStorage
    localStorage.setItem('app-theme', currentTheme);
  }, [currentTheme, systemTheme]);

  const setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const toggleTheme = () => {
    const themeOrder = ['light', 'dark', 'system'];
    const currentIndex = themeOrder.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  const getEffectiveTheme = () => {
    return currentTheme === 'system' ? systemTheme : currentTheme;
  };

  const value = {
    currentTheme,
    systemTheme,
    effectiveTheme: getEffectiveTheme(),
    themes,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={`theme-wrapper theme-${getEffectiveTheme()}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const ThemeToggle = ({ className = '' }) => {
  const { currentTheme, themes, toggleTheme } = useTheme();

  return (
    <button
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      title={`Current theme: ${themes[currentTheme].name}`}
      aria-label="Toggle theme"
    >
      <span className="theme-icon">{themes[currentTheme].icon}</span>
      <span className="theme-name">{themes[currentTheme].name}</span>
    </button>
  );
};

export default ThemeProvider;
