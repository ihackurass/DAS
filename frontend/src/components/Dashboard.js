// src/components/Dashboard.js - versión responsive
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useResponsive from '../hooks/useResponsive';
import ClienteDashboard from './roles/ClienteDashboard';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isMobile, isTablet } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Auto-close sidebar on mobile when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header responsive */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile menu button */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <span className="text-xl">{sidebarOpen ? '✕' : '☰'}</span>
              </button>
            )}

            {/* Logo - responsive size */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="text-xl sm:text-2xl">💧</div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {isMobile ? 'Gota' : 'Gota a Gota'}
              </h1>
            </div>

            {/* User info - responsive */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-2 sm:px-4 py-2 rounded-full shadow-lg">
                <span className="text-sm sm:text-base font-medium">
                  {isMobile ? user.nombre.split(' ')[0] : user.nombre}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-4 py-2 rounded-xl transition-colors text-sm sm:text-base"
              >
                {isMobile ? '🚪' : '🚪 Salir'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Overlay for mobile */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - responsive */}
        <nav className={`
          ${isMobile ? 'fixed' : 'relative'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isMobile ? 'w-80 z-50' : isTablet ? 'w-56' : 'w-64'}
          bg-white/70 backdrop-blur-lg border-r border-gray-200/50 min-h-screen
          transition-transform duration-300 ease-in-out
        `}>
          <div className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Menú</h2>
            <ul className="space-y-2">
              {getMenuItems(user.rol).map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-xl transition-all text-sm sm:text-base ${
                      activeTab === item.id
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg sm:text-xl">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content - responsive padding */}
        <main className={`
          flex-1 p-4 sm:p-6 lg:p-8
          ${isMobile && sidebarOpen ? 'overflow-hidden' : ''}
        `}>
          <ClienteDashboard activeTab={activeTab} />
        </main>
      </div>
    </div>
  );
};

// Helper function
const getMenuItems = (rol) => {
  switch (rol) {
    case 'cliente':
      return [
        { id: 'dashboard', name: 'Dashboard', icon: '📊' },
        { id: 'solicitudes', name: 'Mis Solicitudes', icon: '📋' },
        { id: 'nueva-solicitud', name: 'Nueva Solicitud', icon: '➕' },
        { id: 'historial', name: 'Historial', icon: '📚' }
      ];
    default:
      return [{ id: 'dashboard', name: 'Dashboard', icon: '📊' }];
  }
};

export default Dashboard;