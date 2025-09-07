import React, { useState, useEffect } from 'react';
import { useNeonTheme } from '../contexts/NeonThemeContext';

export const FreePlanLimitWarning = ({ currentUsage, limits, planType, onUpgrade }) => {
  const { isNeonMode, getNeonButtonClass, getNeonCardClass } = useNeonTheme();
  const [showWarning, setShowWarning] = useState(false);
  const [isAtLimit, setIsAtLimit] = useState(false);

  useEffect(() => {
    const invoiceAtLimit = currentUsage.invoice >= limits.invoice;
    const receiptAtLimit = currentUsage.receipt >= limits.receipt;
    const nearLimit = 
      currentUsage.invoice >= limits.invoice - 1 || 
      currentUsage.receipt >= limits.receipt - 1;

    setIsAtLimit(invoiceAtLimit || receiptAtLimit);
    setShowWarning(nearLimit && planType === 'free');
  }, [currentUsage, limits, planType]);

  if (!showWarning) return null;

  const getWarningMessage = () => {
    if (isAtLimit) {
      return {
        title: '🚫 Free Plan Limit Reached!',
        message: 'You\'ve reached your monthly limit. Upgrade to continue creating invoices and receipts.',
        type: 'error'
      };
    } else {
      return {
        title: '⚠️ Approaching Limit',
        message: 'You\'re almost at your free plan limit. Consider upgrading for unlimited access.',
        type: 'warning'
      };
    }
  };

  const warning = getWarningMessage();

  return (
    <div className={`limit-warning-overlay ${isNeonMode ? 'neon-mode' : ''}`}>
      <div className={`limit-warning-modal ${getNeonCardClass('')} ${isNeonMode ? 'card-neon' : ''}`}>
        <div className="warning-header">
          <h3 className="warning-title">{warning.title}</h3>
          <button 
            className="warning-close"
            onClick={() => setShowWarning(false)}
          >
            ×
          </button>
        </div>

        <div className="warning-content">
          <p className="warning-message">{warning.message}</p>
          
          <div className="usage-stats">
            <div className="usage-item">
              <span className="usage-label">Invoices</span>
              <div className="usage-bar">
                <div 
                  className="usage-fill"
                  style={{ 
                    width: `${(currentUsage.invoice / limits.invoice) * 100}%`,
                    backgroundColor: currentUsage.invoice >= limits.invoice ? '#ef4444' : '#3b82f6'
                  }}
                ></div>
              </div>
              <span className="usage-text">{currentUsage.invoice}/{limits.invoice}</span>
            </div>
            
            <div className="usage-item">
              <span className="usage-label">Receipts</span>
              <div className="usage-bar">
                <div 
                  className="usage-fill"
                  style={{ 
                    width: `${(currentUsage.receipt / limits.receipt) * 100}%`,
                    backgroundColor: currentUsage.receipt >= limits.receipt ? '#ef4444' : '#3b82f6'
                  }}
                ></div>
              </div>
              <span className="usage-text">{currentUsage.receipt}/{limits.receipt}</span>
            </div>
          </div>

          <div className="upgrade-benefits">
            <h4>🚀 Pro Plan Benefits:</h4>
            <ul>
              <li>✅ Unlimited invoices & receipts</li>
              <li>✅ No watermark on documents</li>
              <li>✅ All premium themes</li>
              <li>✅ Priority customer support</li>
              <li>✅ Advanced customization options</li>
            </ul>
          </div>
        </div>

        <div className="warning-actions">
          <button 
            className={getNeonButtonClass('btn-upgrade')}
            onClick={onUpgrade}
          >
            💎 Upgrade to Pro - $9.99/month
          </button>
          
          {!isAtLimit && (
            <button 
              className="btn-continue"
              onClick={() => setShowWarning(false)}
            >
              Continue with Free Plan
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .limit-warning-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(5px);
        }

        .limit-warning-modal {
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .neon-mode .limit-warning-modal {
          background: var(--neon-card);
          color: #f1f5f9;
        }

        .warning-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e5e7eb;
        }

        .neon-mode .warning-header {
          border-bottom-color: var(--neon-primary-alpha);
        }

        .warning-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          color: #1f2937;
        }

        .neon-mode .warning-title {
          color: var(--neon-primary);
          text-shadow: 0 0 10px var(--neon-primary-alpha);
        }

        .warning-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .warning-close:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .neon-mode .warning-close {
          color: #9ca3af;
        }

        .neon-mode .warning-close:hover {
          background: var(--neon-primary-alpha);
          color: var(--neon-primary);
        }

        .warning-message {
          font-size: 16px;
          line-height: 1.6;
          color: #4b5563;
          margin-bottom: 24px;
        }

        .neon-mode .warning-message {
          color: #d1d5db;
        }

        .usage-stats {
          margin-bottom: 24px;
        }

        .usage-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .usage-label {
          min-width: 80px;
          font-weight: 600;
          color: #374151;
        }

        .neon-mode .usage-label {
          color: #f3f4f6;
        }

        .usage-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .neon-mode .usage-bar {
          background: #374151;
        }

        .usage-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .usage-text {
          font-weight: 600;
          font-size: 14px;
          color: #6b7280;
        }

        .neon-mode .usage-text {
          color: #9ca3af;
        }

        .upgrade-benefits {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .neon-mode .upgrade-benefits {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--neon-primary-alpha);
        }

        .upgrade-benefits h4 {
          margin: 0 0 12px 0;
          color: #1f2937;
          font-size: 18px;
        }

        .neon-mode .upgrade-benefits h4 {
          color: var(--neon-primary);
        }

        .upgrade-benefits ul {
          margin: 0;
          padding-left: 0;
          list-style: none;
        }

        .upgrade-benefits li {
          padding: 4px 0;
          color: #4b5563;
        }

        .neon-mode .upgrade-benefits li {
          color: #d1d5db;
        }

        .warning-actions {
          display: flex;
          gap: 12px;
          flex-direction: column;
        }

        .btn-upgrade {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-upgrade:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }

        .btn-continue {
          background: transparent;
          color: #6b7280;
          border: 2px solid #e5e7eb;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-continue:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .neon-mode .btn-continue {
          color: #9ca3af;
          border-color: var(--neon-primary-alpha);
        }

        .neon-mode .btn-continue:hover {
          background: var(--neon-primary-alpha);
          border-color: var(--neon-primary);
          color: var(--neon-primary);
        }

        @media (max-width: 640px) {
          .limit-warning-modal {
            padding: 20px;
            margin: 20px;
          }
          
          .warning-actions {
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};
