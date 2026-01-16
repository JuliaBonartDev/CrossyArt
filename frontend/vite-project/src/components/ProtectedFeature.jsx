import React, { useState } from 'react';
import './ProtectedFeature.css';

/**
 * Componente para proteger características que requieren autenticación
 * Muestra un mensaje y botones de login/registro si el usuario intenta usar una característica protegida
 */
export default function ProtectedFeature({
  isAuthenticated,
  featureName,
  onLoginClick,
  onRegisterClick,
  children,
}) {
  const [showMessage, setShowMessage] = useState(false);

  if (isAuthenticated) {
    // Si está autenticado, mostrar el contenido normalmente
    return children;
  }

  // Si no está autenticado, envolver los children con un click handler
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMessage(true);
  };

  return (
    <div className="protected-feature-wrapper">
      <div onClick={handleClick}>
        {children}
      </div>

      {showMessage && (
        <div className="protected-feature-overlay" onClick={() => setShowMessage(false)}>
          <div className="protected-feature-message" onClick={(e) => e.stopPropagation()}>
            <p>To {featureName} you need to register</p>
            <div className="protected-feature-buttons">
              <button 
                className="protected-login-btn"
                onClick={() => {
                  setShowMessage(false);
                  onLoginClick();
                }}
              >
                Login
              </button>
              <button 
                className="protected-register-btn"
                onClick={() => {
                  setShowMessage(false);
                  onRegisterClick();
                }}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
