import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

/**
 * Custom hook para manejar autenticación
 * Proporciona estado y funciones relacionadas con autenticación
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Verificar si el usuario está autenticado al cargar el componente
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          setIsAuthenticated(true);
          // Obtener username del localStorage
          const storedUsername = authService.getUsername();
          if (storedUsername) {
            setUsername(storedUsername);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setUsername(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
        setUser(null);
        setUsername(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Escuchar cambios en el localStorage
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshKey]);

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setUsername(null);
  };

  // Función para refrescar el estado de autenticación (útil después del login)
  const refresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return {
    isAuthenticated,
    user,
    username,
    isLoading,
    logout,
    refresh,
  };
};
