import { API_ENDPOINTS, apiCall, getToken, refreshAccessToken } from './api';

export const patternService = {
  // Create a new pattern
  createPattern: async (patternData) => {
    const formData = new FormData();
    formData.append('name', patternData.name);
    formData.append('size', patternData.size);
    formData.append('description', patternData.description || '');
    formData.append('is_favorite', patternData.is_favorite || false);
    
    if (patternData.image) {
      // Add filename with .png extension - IMPORTANT for Django validation
      formData.append('image', patternData.image, `pattern-${Date.now()}.png`);
    }

    let response = await fetch(API_ENDPOINTS.PATTERNS.CREATE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    });

    // If token expired (401), refresh and retry
    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        response = await fetch(API_ENDPOINTS.PATTERNS.CREATE, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${newToken}`,
          },
          body: formData,
        });
      }
    }

    if (!response.ok) {
      return response.json().then(errorData => {
        console.error('Backend error details:', errorData);
        throw new Error(JSON.stringify(errorData));
      });
    }
    return response.json();
  },

  // Get all patterns for current user (con paginación)
  getUserPatterns: async (limit = 20, offset = 0) => {
    const url = `${API_ENDPOINTS.PATTERNS.LIST}?limit=${limit}&offset=${offset}`;
    return apiCall(url, {
      method: 'GET',
    });
  },

  // Get favorite patterns for current user (con paginación)
  getUserFavorites: async (limit = 20, offset = 0) => {
    const url = `${API_ENDPOINTS.PATTERNS.FAVORITES}?limit=${limit}&offset=${offset}`;
    return apiCall(url, {
      method: 'GET',
    });
  },

  // Update pattern (name, description, is_favorite, etc)
  updatePattern: async (patternId, updateData) => {
    return apiCall(API_ENDPOINTS.PATTERNS.UPDATE(patternId), {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },

  // Delete pattern
  deletePattern: async (patternId) => {
    return apiCall(API_ENDPOINTS.PATTERNS.DELETE(patternId), {
      method: 'DELETE',
    });
  },
};
