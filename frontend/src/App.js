// src/App.js
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './index.css';

// Componente que maneja la navegación
const AppRouter = () => {
  const { isAuthenticated, loading, user } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">💧</div>
          <div className="text-white text-xl font-semibold">Cargando Gota a Gota...</div>
          <div className="text-white/70 text-sm mt-2">Verificando sesión</div>
        </div>
      </div>
    );
  }

  // Render based on authentication
  return isAuthenticated ? <Dashboard /> : <Login />;
};

// Componente principal
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;