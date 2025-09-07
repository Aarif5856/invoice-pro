import React, { createContext, useContext, useState, useEffect } from 'react';

const NeonThemeContext = createContext();

export const useNeonTheme = () => {
  const context = useContext(NeonThemeContext);
  if (!context) {
    throw new Error('useNeonTheme must be used within a NeonThemeProvider');
  }
  return context;
};

export const NeonThemeProvider = ({ children }) => {
  const [isNeonMode, setIsNeonMode] = useState(false);

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('neon-mode');
    if (saved === 'true') {
      setIsNeonMode(true);
    }
  }, []);

  // Apply neon mode to body
  useEffect(() => {
    if (isNeonMode) {
      document.body.classList.add('neon-mode');
    } else {
      document.body.classList.remove('neon-mode');
    }
    
    // Save preference
    localStorage.setItem('neon-mode', isNeonMode.toString());
  }, [isNeonMode]);

  const toggleNeonMode = () => {
    setIsNeonMode(!isNeonMode);
  };

  const value = {
    isNeonMode,
    toggleNeonMode,
    // Utility functions for applying neon classes
    getNeonButtonClass: (baseClass = '') => 
      isNeonMode ? `${baseClass} btn-neon` : baseClass,
    getNeonInputClass: (baseClass = '') => 
      isNeonMode ? `${baseClass} form-input-neon` : baseClass,
    getNeonCardClass: (baseClass = '') => 
      isNeonMode ? `${baseClass} card-neon` : baseClass,
    getNeonTextClass: (baseClass = '') => 
      isNeonMode ? `${baseClass} text-neon` : baseClass,
  };

  return (
    <NeonThemeContext.Provider value={value}>
      {children}
    </NeonThemeContext.Provider>
  );
};

// Neon Toggle Button Component
export const NeonToggle = () => {
  const { isNeonMode, toggleNeonMode } = useNeonTheme();

  return (
    <button 
      className="neon-toggle"
      onClick={toggleNeonMode}
      title={isNeonMode ? 'Disable Neon Mode' : 'Enable Neon Mode'}
    >
      {isNeonMode ? '🌙 Neon OFF' : '⚡ Neon ON'}
    </button>
  );
};
