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
  const [neonColor, setNeonColor] = useState('cyan'); // cyan, purple, green, gold
  const [showParticles, setShowParticles] = useState(true);
  const [showMatrixRain, setShowMatrixRain] = useState(false);
  const [showBackgroundOrbs, setShowBackgroundOrbs] = useState(true);

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem('neon-mode');
    const savedColor = localStorage.getItem('neon-color');
    const savedParticles = localStorage.getItem('neon-particles');
    const savedMatrix = localStorage.getItem('neon-matrix');
    const savedOrbs = localStorage.getItem('neon-orbs');
    
    if (saved === 'true') setIsNeonMode(true);
    if (savedColor) setNeonColor(savedColor);
    if (savedParticles !== null) setShowParticles(savedParticles === 'true');
    if (savedMatrix !== null) setShowMatrixRain(savedMatrix === 'true');
    if (savedOrbs !== null) setShowBackgroundOrbs(savedOrbs === 'true');
  }, []);

  // Apply neon mode and theme to body
  useEffect(() => {
    const body = document.body;
    
    // Remove all neon classes
    body.classList.remove('neon-mode', 'neon-theme-cyan', 'neon-theme-purple', 'neon-theme-green', 'neon-theme-gold');
    
    if (isNeonMode) {
      body.classList.add('neon-mode', `neon-theme-${neonColor}`);
    }
    
    // Save preferences
    localStorage.setItem('neon-mode', isNeonMode.toString());
    localStorage.setItem('neon-color', neonColor);
    localStorage.setItem('neon-particles', showParticles.toString());
    localStorage.setItem('neon-matrix', showMatrixRain.toString());
    localStorage.setItem('neon-orbs', showBackgroundOrbs.toString());
  }, [isNeonMode, neonColor, showParticles, showMatrixRain, showBackgroundOrbs]);

  const toggleNeonMode = () => {
    setIsNeonMode(!isNeonMode);
  };

  const cycleNeonColor = () => {
    const colors = ['cyan', 'purple', 'green', 'gold'];
    const currentIndex = colors.indexOf(neonColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    setNeonColor(colors[nextIndex]);
  };

  const value = {
    isNeonMode,
    neonColor,
    showParticles,
    showMatrixRain,
    showBackgroundOrbs,
    toggleNeonMode,
    cycleNeonColor,
    setShowParticles,
    setShowMatrixRain,
    setShowBackgroundOrbs,
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

// Enhanced Neon Controls Component
export const NeonControls = () => {
  const { 
    isNeonMode, 
    neonColor, 
    showParticles, 
    showMatrixRain, 
    showBackgroundOrbs,
    toggleNeonMode, 
    cycleNeonColor,
    setShowParticles,
    setShowMatrixRain,
    setShowBackgroundOrbs
  } = useNeonTheme();

  const getColorEmoji = () => {
    switch(neonColor) {
      case 'cyan': return '💎';
      case 'purple': return '🔮';
      case 'green': return '💚';
      case 'gold': return '⭐';
      default: return '💎';
    }
  };

  const getColorName = () => {
    return neonColor.charAt(0).toUpperCase() + neonColor.slice(1);
  };

  if (!isNeonMode) {
    return (
      <button 
        className="neon-toggle"
        onClick={toggleNeonMode}
        title="Enable Neon Mode"
      >
        ⚡ Neon ON
      </button>
    );
  }

  return (
    <div className="neon-controls-panel">
      <button 
        className="neon-toggle"
        onClick={toggleNeonMode}
        title="Disable Neon Mode"
      >
        🌙 Neon OFF
      </button>
      
      <button 
        className="neon-color-toggle"
        onClick={cycleNeonColor}
        title={`Current: ${getColorName()} Theme - Click to cycle`}
      >
        {getColorEmoji()} {getColorName()}
      </button>
      
      <div className="neon-effects-toggles">
        <button 
          className={`neon-effect-btn ${showParticles ? 'active' : ''}`}
          onClick={() => setShowParticles(!showParticles)}
          title="Toggle Floating Particles"
        >
          ✨ Particles
        </button>
        
        <button 
          className={`neon-effect-btn ${showMatrixRain ? 'active' : ''}`}
          onClick={() => setShowMatrixRain(!showMatrixRain)}
          title="Toggle Matrix Rain"
        >
          �️ Matrix
        </button>
        
        <button 
          className={`neon-effect-btn ${showBackgroundOrbs ? 'active' : ''}`}
          onClick={() => setShowBackgroundOrbs(!showBackgroundOrbs)}
          title="Toggle Background Orbs"
        >
          🔵 Orbs
        </button>
      </div>
    </div>
  );
};
