import React from 'react';
import './FavoritesModal.css';

/**
 * Modal que muestra los patrones favoritos guardados del usuario
 */
export default function FavoritesModal({
  isVisible,
  onClose,
  favorites = [],
}) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="favorites-modal" onClick={(e) => e.stopPropagation()}>
        <div className="favorites-header">
          <h2>Favorites</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="favorites-content">
          {favorites.length === 0 ? (
            <p className="no-favorites">No favorite patterns yet. Start saving your creations!</p>
          ) : (
            <div className="favorites-grid">
              {favorites.map((favorite, index) => (
                <div key={index} className="favorite-item">
                  <div className="favorite-info">
                    <p className="favorite-name">{favorite.name || `Pattern ${index + 1}`}</p>
                    <p className="favorite-size">Size: {favorite.size}X{favorite.size}</p>
                  </div>
                  <div className="favorite-image">
                    <img 
                      src={favorite.imageUrl} 
                      alt={favorite.name || `Pattern ${index + 1}`}
                    />
                  </div>
                  
                  <div className="favorite-actions">
                    <button className="download-btn" title="Download">
                      Download
                    </button>
                    <button className="delete-btn" title="Delete">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
