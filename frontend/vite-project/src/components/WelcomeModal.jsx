import React from 'react';
import './WelcomeModal.css';

/**
 * Modal de bienvenida que se muestra a usuarios no autenticados
 * Informa sobre la necesidad de registrarse para usar ciertas características
 */
export default function WelcomeModal({
  isVisible,
  onClose,
  onRegisterClick,
  onLoginClick,
}) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="welcome-modal-overlay" onClick={onClose}>
      <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
        <div className="welcome-modal-header">
          <h2>Welcome to CrossyArt</h2>
          <button className="welcome-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="welcome-modal-content">
          <div className="welcome-icon">🎨</div>
          
          <p className="welcome-title">Unlock All Features</p>
          
          <p className="welcome-description">
            Create beautiful cross stitch patterns from your photos and save your favorites!
          </p>

          <div className="welcome-features">
            <div className="welcome-feature">
              <span className="feature-icon">📋</span>
              <span className="feature-text">View your pattern history</span>
            </div>
            <div className="welcome-feature">
              <span className="feature-icon">❤️</span>
              <span className="feature-text">Save favorite patterns</span>
            </div>
            <div className="welcome-feature">
              <span className="feature-icon">☁️</span>
              <span className="feature-text">Sync across devices</span>
            </div>
          </div>
        </div>

        <div className="welcome-modal-footer">
          <button 
            className="welcome-register-btn"
            onClick={onRegisterClick}
          >
            Create Account
          </button>
          <button 
            className="welcome-login-btn"
            onClick={onLoginClick}
          >
            I Already Have an Account
          </button>
          <button 
            className="welcome-skip-btn"
            onClick={onClose}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
