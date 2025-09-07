import React, { useState } from 'react';
import { useNeonTheme } from '../contexts/NeonThemeContext';

export const ThemeSelector = ({ selectedTheme, onThemeChange, themes }) => {
  const { isNeonMode, getNeonCardClass } = useNeonTheme();
  const [hoveredTheme, setHoveredTheme] = useState(null);

  const themeDescriptions = {
    minimalist: {
      name: 'Minimalist',
      description: 'Clean and professional design',
      colors: ['#f8fafc', '#64748b', '#1e293b'],
      features: ['Simple layout', 'Clean typography', 'Professional look']
    },
    corporate: {
      name: 'Corporate',
      description: 'Traditional business style',
      colors: ['#1e40af', '#3b82f6', '#dbeafe'],
      features: ['Business colors', 'Formal layout', 'Corporate branding']
    },
    creative: {
      name: 'Creative',
      description: 'Modern and colorful design',
      colors: ['#7c3aed', '#a855f7', '#f3e8ff'],
      features: ['Vibrant colors', 'Modern layout', 'Eye-catching design']
    },
    elegant: {
      name: 'Elegant',
      description: 'Sophisticated and refined',
      colors: ['#374151', '#6b7280', '#f9fafb'],
      features: ['Refined typography', 'Balanced layout', 'Timeless design']
    }
  };

  const getThemePreview = (themeKey) => {
    const theme = themeDescriptions[themeKey] || themeDescriptions.minimalist;
    return (
      <div className="theme-preview">
        <div className="preview-header" style={{ backgroundColor: theme.colors[0] }}>
          <div className="preview-logo"></div>
          <div className="preview-title" style={{ color: theme.colors[2] }}>
            Invoice Preview
          </div>
        </div>
        <div className="preview-content">
          <div className="preview-line long" style={{ backgroundColor: theme.colors[1] }}></div>
          <div className="preview-line short" style={{ backgroundColor: theme.colors[1] }}></div>
          <div className="preview-line medium" style={{ backgroundColor: theme.colors[1] }}></div>
        </div>
        <div className="preview-colors">
          {theme.colors.map((color, index) => (
            <div 
              key={index} 
              className="color-dot" 
              style={{ backgroundColor: color }}
            ></div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`theme-selector ${isNeonMode ? 'neon-mode' : ''}`}>
      <label className="theme-selector-label">Choose Invoice Theme</label>
      <div className="theme-grid">
        {Object.entries(themes).map(([key, theme]) => {
          const themeInfo = themeDescriptions[key] || themeDescriptions.minimalist;
          const isSelected = selectedTheme === key;
          const isHovered = hoveredTheme === key;
          
          return (
            <div
              key={key}
              className={`theme-card ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${getNeonCardClass('')}`}
              onClick={() => onThemeChange(key)}
              onMouseEnter={() => setHoveredTheme(key)}
              onMouseLeave={() => setHoveredTheme(null)}
            >
              <div className="theme-preview-container">
                {getThemePreview(key)}
                {isSelected && (
                  <div className="selected-badge">
                    ✅ Selected
                  </div>
                )}
              </div>
              
              <div className="theme-info">
                <h3 className="theme-name">{themeInfo.name}</h3>
                <p className="theme-description">{themeInfo.description}</p>
                
                {isHovered && (
                  <div className="theme-features">
                    <h4>Features:</h4>
                    <ul>
                      {themeInfo.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .theme-selector {
          margin-bottom: 24px;
        }

        .theme-selector-label {
          display: block;
          font-weight: 600;
          margin-bottom: 16px;
          color: #374151;
        }

        .neon-mode .theme-selector-label {
          color: var(--neon-primary);
          text-shadow: 0 0 5px var(--neon-primary-alpha);
        }

        .theme-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .theme-card {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: white;
          position: relative;
          overflow: hidden;
        }

        .theme-card:hover,
        .theme-card.hovered {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-color: #6366f1;
        }

        .theme-card.selected {
          border-color: #10b981;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.2);
        }

        .neon-mode .theme-card {
          background: var(--neon-card);
          border-color: var(--neon-primary-alpha);
        }

        .neon-mode .theme-card.selected {
          border-color: var(--neon-primary);
          box-shadow: 0 8px 25px var(--neon-primary-alpha);
        }

        .theme-preview-container {
          position: relative;
        }

        .theme-preview {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 12px;
          background: white;
          height: 120px;
        }

        .preview-header {
          height: 40px;
          display: flex;
          align-items: center;
          padding: 8px 12px;
          gap: 8px;
        }

        .preview-logo {
          width: 24px;
          height: 24px;
          background: #d1d5db;
          border-radius: 4px;
        }

        .preview-title {
          font-size: 12px;
          font-weight: 600;
        }

        .preview-content {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .preview-line {
          height: 4px;
          border-radius: 2px;
          opacity: 0.7;
        }

        .preview-line.long {
          width: 100%;
        }

        .preview-line.medium {
          width: 70%;
        }

        .preview-line.short {
          width: 40%;
        }

        .preview-colors {
          position: absolute;
          bottom: 8px;
          right: 8px;
          display: flex;
          gap: 4px;
        }

        .color-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        .selected-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #10b981;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
        }

        .theme-info {
          text-align: center;
        }

        .theme-name {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #1f2937;
        }

        .neon-mode .theme-name {
          color: #f1f5f9;
        }

        .theme-description {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 12px 0;
        }

        .neon-mode .theme-description {
          color: #9ca3af;
        }

        .theme-features {
          background: #f8fafc;
          border-radius: 8px;
          padding: 12px;
          text-align: left;
          animation: slideIn 0.3s ease-out;
        }

        .neon-mode .theme-features {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--neon-primary-alpha);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .theme-features h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #374151;
        }

        .neon-mode .theme-features h4 {
          color: var(--neon-primary);
        }

        .theme-features ul {
          margin: 0;
          padding-left: 16px;
          list-style: none;
        }

        .theme-features li {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
          position: relative;
        }

        .theme-features li:before {
          content: "•";
          position: absolute;
          left: -12px;
          color: #6366f1;
        }

        .neon-mode .theme-features li {
          color: #d1d5db;
        }

        @media (max-width: 768px) {
          .theme-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
