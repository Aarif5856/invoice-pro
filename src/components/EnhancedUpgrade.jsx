import React, { useState } from 'react';
import { useNeonTheme } from '../contexts/NeonThemeContext';

export const EnhancedUpgradeButton = ({ currentPlan, onClick }) => {
  const { isNeonMode, getNeonButtonClass } = useNeonTheme();
  const [isHovered, setIsHovered] = useState(false);

  if (currentPlan !== 'free') return null;

  return (
    <div className="enhanced-upgrade-container">
      <button
        className={`enhanced-upgrade-btn ${getNeonButtonClass('')} ${isNeonMode ? 'neon-mega-upgrade' : ''}`}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="upgrade-content">
          <div className="upgrade-icon">💎</div>
          <div className="upgrade-text">
            <span className="upgrade-main">Upgrade to Pro</span>
            <span className="upgrade-price">$9.99/month</span>
          </div>
          <div className="upgrade-arrow">→</div>
        </div>
        
        {isHovered && (
          <div className="upgrade-benefits-tooltip">
            <div className="benefit-item">✅ Unlimited documents</div>
            <div className="benefit-item">✅ No watermarks</div>
            <div className="benefit-item">✅ All themes</div>
            <div className="benefit-item">✅ Priority support</div>
          </div>
        )}
      </button>

      <style jsx>{`
        .enhanced-upgrade-container {
          position: relative;
          display: inline-block;
        }

        .enhanced-upgrade-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.4s ease;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
          position: relative;
          overflow: hidden;
          transform: translateY(0);
          animation: upgrade-pulse 3s infinite;
        }

        .enhanced-upgrade-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.7s ease;
        }

        .enhanced-upgrade-btn:hover::before {
          left: 100%;
        }

        .enhanced-upgrade-btn:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
        }

        .neon-mega-upgrade {
          background: transparent !important;
          border: 3px solid var(--neon-primary) !important;
          color: var(--neon-primary) !important;
          box-shadow: var(--neon-glow-lg), 0 0 40px var(--neon-primary-alpha) !important;
          animation: neon-mega-pulse 2s infinite !important;
        }

        .neon-mega-upgrade:hover {
          background: var(--neon-primary) !important;
          color: var(--neon-dark) !important;
          box-shadow: var(--neon-glow-xl), 0 0 60px var(--neon-primary), 0 0 80px var(--neon-primary-bright) !important;
          transform: translateY(-6px) scale(1.08) !important;
        }

        .upgrade-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .upgrade-icon {
          font-size: 24px;
          animation: upgrade-icon-bounce 2s infinite;
        }

        .upgrade-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .upgrade-main {
          font-size: 18px;
          font-weight: 800;
          line-height: 1;
        }

        .upgrade-price {
          font-size: 14px;
          opacity: 0.9;
          font-weight: 600;
        }

        .upgrade-arrow {
          font-size: 20px;
          transition: transform 0.3s ease;
        }

        .enhanced-upgrade-btn:hover .upgrade-arrow {
          transform: translateX(4px);
        }

        .upgrade-benefits-tooltip {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.95);
          color: white;
          padding: 16px 20px;
          border-radius: 12px;
          margin-top: 8px;
          white-space: nowrap;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          animation: tooltip-appear 0.3s ease;
          z-index: 1000;
        }

        .neon-mega-upgrade .upgrade-benefits-tooltip {
          background: var(--neon-card);
          border: 2px solid var(--neon-primary);
          box-shadow: var(--neon-glow-md);
          color: var(--neon-primary);
        }

        .upgrade-benefits-tooltip::before {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-bottom-color: rgba(0, 0, 0, 0.95);
        }

        .neon-mega-upgrade .upgrade-benefits-tooltip::before {
          border-bottom-color: var(--neon-primary);
        }

        .benefit-item {
          padding: 4px 0;
          font-size: 14px;
          font-weight: 600;
        }

        @keyframes upgrade-pulse {
          0%, 100% {
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
          }
          50% {
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.6), 0 0 20px rgba(102, 126, 234, 0.3);
          }
        }

        @keyframes neon-mega-pulse {
          0%, 100% {
            box-shadow: var(--neon-glow-lg), 0 0 40px var(--neon-primary-alpha);
          }
          50% {
            box-shadow: var(--neon-glow-xl), 0 0 60px var(--neon-primary-alpha), 0 0 80px var(--neon-primary-alpha);
          }
        }

        @keyframes upgrade-icon-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes tooltip-appear {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @media (max-width: 640px) {
          .enhanced-upgrade-btn {
            padding: 14px 20px;
            font-size: 15px;
          }
          
          .upgrade-benefits-tooltip {
            left: 0;
            right: 0;
            transform: none;
            margin: 8px 20px 0 20px;
          }
          
          .upgrade-benefits-tooltip::before {
            left: 50%;
          }
        }
      `}</style>
    </div>
  );
};

export const PlanComparisonCard = ({ planType, features, price, isRecommended, onSelect }) => {
  const { isNeonMode, getNeonCardClass, getNeonButtonClass } = useNeonTheme();

  return (
    <div className={`plan-card ${planType} ${isRecommended ? 'recommended' : ''} ${getNeonCardClass('')} ${isNeonMode ? 'plan-card-neon' : ''}`}>
      {isRecommended && (
        <div className="recommended-badge">
          🌟 Most Popular
        </div>
      )}
      
      <div className="plan-header">
        <h3 className="plan-title">{planType === 'free' ? 'Free Plan' : 'Pro Plan'}</h3>
        <div className="plan-price">
          {price === 0 ? 'Free' : `$${price}/month`}
        </div>
      </div>

      <div className="plan-features">
        {features.map((feature, index) => (
          <div key={index} className={`feature-item ${feature.included ? 'included' : 'excluded'}`}>
            <span className="feature-icon">{feature.included ? '✅' : '❌'}</span>
            <span className="feature-text">{feature.text}</span>
          </div>
        ))}
      </div>

      <button 
        className={`plan-select-btn ${getNeonButtonClass('')}`}
        onClick={() => onSelect(planType)}
        disabled={planType === 'free'}
      >
        {planType === 'free' ? 'Current Plan' : '💎 Upgrade Now'}
      </button>

      <style jsx>{`
        .plan-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          position: relative;
          transition: all 0.3s ease;
          min-height: 400px;
          display: flex;
          flex-direction: column;
        }

        .plan-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
        }

        .plan-card.recommended {
          border-color: #667eea;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
        }

        .recommended-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
        }

        .plan-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .plan-title {
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: #1f2937;
        }

        .plan-price {
          font-size: 32px;
          font-weight: 900;
          color: #667eea;
        }

        .plan-features {
          flex: 1;
          margin-bottom: 24px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
        }

        .feature-icon {
          font-size: 18px;
        }

        .feature-text {
          font-size: 16px;
          color: #374151;
        }

        .feature-item.excluded .feature-text {
          color: #9ca3af;
          text-decoration: line-through;
        }

        .plan-select-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }

        .plan-select-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .plan-select-btn:disabled {
          background: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .neon-mode .plan-card {
          background: var(--neon-card);
          color: #f1f5f9;
        }

        .neon-mode .plan-title {
          color: var(--neon-primary);
        }

        .neon-mode .feature-text {
          color: #d1d5db;
        }

        .neon-mode .feature-item.excluded .feature-text {
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};
