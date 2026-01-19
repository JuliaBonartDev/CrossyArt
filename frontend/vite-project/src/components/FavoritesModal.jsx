import React, { useState } from 'react';
import './FavoritesModal.css';
import { patternService } from '../services/patternService';

/**
 * Modal que muestra los patrones favoritos guardados del usuario
 */
export default function FavoritesModal({
  isVisible,
  onClose,
  favorites = [],
  onDeleteFavorite,
}) {
  const [isDeleting, setIsDeleting] = useState(null);

  // Validar que favorites sea un array
  const favoritesArray = Array.isArray(favorites) ? favorites : [];

  const handleDownload = async (favorite) => {
    if (!favorite.image_url && !favorite.image) {
      alert('Image URL not available');
      return;
    }

    try {
      const imageUrl = favorite.image_url || favorite.image;
      
      // Fetch the image as a blob
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();
      
      // Create a blob URL and download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${favorite.name || 'pattern'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Error downloading image');
    }
  };

  const handleDelete = async (patternId) => {
    if (!window.confirm('Are you sure you want to delete this pattern?')) {
      return;
    }

    setIsDeleting(patternId);
    try {
      await patternService.deletePattern(patternId);
      onDeleteFavorite(patternId);
      alert('Pattern deleted successfully');
    } catch (error) {
      console.error('Error deleting pattern:', error);
      alert('Error deleting pattern');
    } finally {
      setIsDeleting(null);
    }
  };

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
          {favoritesArray.length === 0 ? (
            <p className="no-favorites">No favorite patterns yet. Start saving your creations!</p>
          ) : (
            <div className="favorites-grid">
              {favoritesArray.map((favorite, index) => (
                <div key={favorite.id || index} className="favorite-item">
                  <div className="favorite-info">
                    <p className="favorite-name">{favorite.name || `Pattern ${index + 1}`}</p>
                    <p className="favorite-size">Size: {favorite.size}X{favorite.size}</p>
                  </div>
                  <div className="favorite-image">
                    <img 
                      src={favorite.image_url || favorite.imageUrl} 
                      alt={favorite.name || `Pattern ${index + 1}`}
                    />
                  </div>
                  
                  <div className="favorite-actions">
                    <button 
                      className="download-btn" 
                      title="Download"
                      onClick={() => handleDownload(favorite)}
                      disabled={isDeleting === favorite.id}
                    >
                      Download
                    </button>
                    <button 
                      className="delete-btn" 
                      title="Delete"
                      onClick={() => handleDelete(favorite.id)}
                      disabled={isDeleting === favorite.id}
                    >
                      {isDeleting === favorite.id ? 'Deleting...' : 'Delete'}
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
