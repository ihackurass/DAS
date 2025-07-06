// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario del sessionStorage al iniciar
  useEffect(() => {
    try {
      const savedUser = sessionStorage.getItem('user');
      const savedToken = sessionStorage.getItem('token');
      
      if (savedUser && savedToken) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log('✅ Usuario restaurado:', userData.nombre);
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
      // Limpiar datos corruptos
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    try {
      setUser(userData);
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('token', token);
      console.log('✅ Login exitoso:', userData.nombre);
    } catch (error) {
      console.error('Error en login:', error);
      throw new Error('Error guardando sesión');
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    console.log('🚪 Logout completado');
  };

  const isTokenValid = () => {
    const token = sessionStorage.getItem('token');
    return !!token; // Validación básica, mejorará con JWT
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user && isTokenValid(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};