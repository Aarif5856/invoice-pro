import React from 'react';
import { useNeonTheme } from '../contexts/NeonThemeContext';

// Floating Particles Component
export const NeonFloatingParticles = () => {
  const { isNeonMode, showParticles } = useNeonTheme();

  if (!isNeonMode || !showParticles) return null;

  const particles = ['💎', '✨', '⚡', '🌟', '💫', '🔥', '⭐', '💥'];

  return (
    <div className="neon-floating-particles">
      {particles.map((particle, index) => (
        <div key={index} className="neon-particle">
          {particle}
        </div>
      ))}
    </div>
  );
};

// Matrix Rain Component
export const NeonMatrixRain = () => {
  const { isNeonMode, showMatrixRain } = useNeonTheme();

  if (!isNeonMode || !showMatrixRain) return null;

  const matrixChars = ['0', '1', '$', '@', '#', '%', '&', '*', '+', '='];
  
  const generateMatrixColumn = () => {
    return Array(20).fill(0).map(() => 
      matrixChars[Math.floor(Math.random() * matrixChars.length)]
    ).join('\n');
  };

  return (
    <div className="neon-matrix-rain">
      {Array(10).fill(0).map((_, index) => (
        <div key={index} className="neon-matrix-column">
          {generateMatrixColumn()}
        </div>
      ))}
    </div>
  );
};

// Background Orbs Component
export const NeonBackgroundOrbs = () => {
  const { isNeonMode, showBackgroundOrbs } = useNeonTheme();

  if (!isNeonMode || !showBackgroundOrbs) return null;

  return (
    <div className="neon-background-orbs">
      <div className="neon-orb"></div>
      <div className="neon-orb"></div>
      <div className="neon-orb"></div>
    </div>
  );
};

// Interactive Sound Button (placeholder for future sound integration)
export const NeonSoundToggle = () => {
  const { isNeonMode } = useNeonTheme();
  const [soundEnabled, setSoundEnabled] = React.useState(false);

  if (!isNeonMode) return null;

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    // Future: Add actual sound integration here
    console.log('🔊 Sound effects:', soundEnabled ? 'OFF' : 'ON');
  };

  return (
    <button 
      className="neon-sound-toggle"
      onClick={toggleSound}
      title={`Sound Effects: ${soundEnabled ? 'ON' : 'OFF'}`}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'transparent',
        border: '2px solid var(--neon-primary)',
        color: 'var(--neon-primary)',
        padding: '10px 15px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: 'var(--neon-glow-sm)',
        transition: 'all 0.3s ease',
        zIndex: 1001
      }}
    >
      {soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
    </button>
  );
};

// Enhanced Particle Burst Effect
export const NeonParticleBurst = ({ trigger, position }) => {
  const { isNeonMode } = useNeonTheme();
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    if (trigger && isNeonMode) {
      setIsActive(true);
      setTimeout(() => setIsActive(false), 1000);
    }
  }, [trigger, isNeonMode]);

  if (!isActive || !isNeonMode) return null;

  const burstParticles = ['💥', '⚡', '✨', '🌟', '💫'];

  return (
    <div 
      className="neon-particle-burst"
      style={{
        position: 'fixed',
        left: position?.x || '50%',
        top: position?.y || '50%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {burstParticles.map((particle, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            fontSize: '20px',
            animation: `neon-burst-${index} 1s ease-out forwards`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {particle}
        </div>
      ))}
      <style jsx>{`
        @keyframes neon-burst-0 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-80px, -80px) scale(1); opacity: 0; }
        }
        @keyframes neon-burst-1 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(80px, -80px) scale(1); opacity: 0; }
        }
        @keyframes neon-burst-2 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-80px, 80px) scale(1); opacity: 0; }
        }
        @keyframes neon-burst-3 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(80px, 80px) scale(1); opacity: 0; }
        }
        @keyframes neon-burst-4 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(0, -100px) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
