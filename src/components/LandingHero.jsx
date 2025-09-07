import React from 'react';
import { useNeonTheme } from '../contexts/NeonThemeContext';

const LandingHero = () => {
  const { isNeonMode, getNeonButtonClass, getNeonTextClass } = useNeonTheme();
  
  return (
    <section className="landing-hero">
      <div className="hero-background">
        <div className="hero-gradient"></div>
        <div className="hero-pattern"></div>
      </div>
      
      <div className="hero-content">
        <div className={`hero-badge animate-fade-in-up ${isNeonMode ? 'neon-border-animate' : ''}`}>
          <span className="badge-icon">✨</span>
          <span>Professional Invoice & Receipt Generator</span>
        </div>
        
        <h1 className={`hero-title animate-fade-in-up ${getNeonTextClass('')}`}>
          Create Beautiful <span className={`title-highlight ${isNeonMode ? 'text-neon-bright neon-text-flicker' : ''}`}>Invoices</span> 
          <br />& <span className={`title-highlight ${isNeonMode ? 'text-neon-bright neon-text-flicker' : ''}`}>Receipts</span> in Seconds
        </h1>
        
        <p className="hero-description animate-fade-in-up">
          Professional, customizable, and mobile-friendly. Generate PDF invoices and receipts 
          with your branding, accept payments globally, and manage your business finances effortlessly.
        </p>
        
        <div className="hero-features animate-fade-in-up">
          <div className="feature-item">
            <span className="feature-icon">🎨</span>
            <span>Custom Themes</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💰</span>
            <span>Payment Integration</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📱</span>
            <span>Mobile Friendly</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <span>Secure & Private</span>
          </div>
        </div>
        
        <div className="hero-stats animate-fade-in-up">
          <div className="stat-item">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Documents Created</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">5⭐</div>
            <div className="stat-label">User Rating</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">150+</div>
            <div className="stat-label">Countries</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
