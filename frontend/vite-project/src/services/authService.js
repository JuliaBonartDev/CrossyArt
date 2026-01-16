import { API_ENDPOINTS, apiCall, setTokens, clearTokens, getToken } from './api';

export const authService = {
  // Register
  register: async (username, email, password) => {
    const response = await apiCall(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        password,
        password2: password,
      }),
    });
    return response;
  },

  // Login
  login: async (username, password) => {
    const response = await apiCall(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
      }),
    });
    
    // Guardar tokens
    if (response.tokens) {
      setTokens(response.tokens.access, response.tokens.refresh);
    }

    // Guardar username en localStorage
    if (response.user && response.user.username) {
      localStorage.setItem('username', response.user.username);
    }
    
    return response;
  },

  // Get profile
  getProfile: async () => {
    const response = await apiCall(API_ENDPOINTS.AUTH.PROFILE, {
      method: 'GET',
    });
    return response;
  },

  // Get stored username
  getUsername: () => {
    return localStorage.getItem('username');
  },

  // Logout
  logout: () => {
    clearTokens();
    localStorage.removeItem('username');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getToken();
  },
};
