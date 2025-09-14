import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    keyboardNavigation: false,
    screenReader: false
  });

  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem('accessibility-preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading accessibility preferences:', error);
      }
    }

    // Detect system preferences
    detectSystemPreferences();
    setupKeyboardNavigation();
  }, []);

  useEffect(() => {
    // Save preferences
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
    
    // Apply preferences to document
    applyPreferences();
  }, [preferences]);

  const detectSystemPreferences = () => {
    // Detect reduced motion preference
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Detect high contrast preference
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;

    // Check if using screen reader
    const screenReader = 'speechSynthesis' in window && window.navigator.userAgent.includes('NVDA');

    setPreferences(prev => ({
      ...prev,
      reduceMotion,
      highContrast,
      screenReader
    }));
  };

  const applyPreferences = () => {
    const root = document.documentElement;

    // Apply reduced motion
    if (preferences.reduceMotion) {
      root.style.setProperty('--transition-fast', '0ms');
      root.style.setProperty('--transition-normal', '0ms');
      root.style.setProperty('--transition-slow', '0ms');
      root.classList.add('reduce-motion');
    } else {
      root.style.removeProperty('--transition-fast');
      root.style.removeProperty('--transition-normal');
      root.style.removeProperty('--transition-slow');
      root.classList.remove('reduce-motion');
    }

    // Apply high contrast
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply large text
    if (preferences.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Apply keyboard navigation styles
    if (preferences.keyboardNavigation) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }
  };

  const setupKeyboardNavigation = () => {
    const handleKeyDown = (event) => {
      if (event.key === 'Tab') {
        setPreferences(prev => ({ ...prev, keyboardNavigation: true }));
      }
    };

    const handleMouseDown = () => {
      setPreferences(prev => ({ ...prev, keyboardNavigation: false }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const announce = (message, priority = 'polite') => {
    const id = Date.now();
    const announcement = { id, message, priority };
    
    setAnnouncements(prev => [...prev, announcement]);
    
    // Remove announcement after 5 seconds
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 5000);
  };

  const skipToContent = () => {
    const main = document.querySelector('main') || document.querySelector('#main-content');
    if (main) {
      main.focus();
      main.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const value = {
    preferences,
    updatePreference,
    announce,
    skipToContent,
    announcements
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      
      {/* Screen reader announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcements
          .filter(a => a.priority === 'polite')
          .map(a => a.message)
          .join('. ')}
      </div>
      
      <div 
        aria-live="assertive" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcements
          .filter(a => a.priority === 'assertive')
          .map(a => a.message)
          .join('. ')}
      </div>

      {/* Skip to content link */}
      <a
        href="#main-content"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          skipToContent();
        }}
      >
        Skip to main content
      </a>
    </AccessibilityContext.Provider>
  );
};

export const AccessibilityPanel = () => {
  const { preferences, updatePreference } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="accessibility-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Accessibility options"
        title="Accessibility options"
      >
        ♿
      </button>

      {isOpen && (
        <div className="accessibility-panel">
          <div className="accessibility-panel-header">
            <h3>Accessibility Options</h3>
            <button
              className="panel-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close accessibility panel"
            >
              ✕
            </button>
          </div>

          <div className="accessibility-options">
            <label className="accessibility-option">
              <input
                type="checkbox"
                checked={preferences.reduceMotion}
                onChange={(e) => updatePreference('reduceMotion', e.target.checked)}
              />
              <span>Reduce motion and animations</span>
            </label>

            <label className="accessibility-option">
              <input
                type="checkbox"
                checked={preferences.highContrast}
                onChange={(e) => updatePreference('highContrast', e.target.checked)}
              />
              <span>High contrast mode</span>
            </label>

            <label className="accessibility-option">
              <input
                type="checkbox"
                checked={preferences.largeText}
                onChange={(e) => updatePreference('largeText', e.target.checked)}
              />
              <span>Large text</span>
            </label>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityProvider;
