// src/components/roles/ClienteDashboard.js
import React, { useState, useEffect } from 'react';
import { solicitudAPI } from '../../services/api';
import SolicitudForm from '../SolicitudForm';

const ClienteDashboard = ({ activeTab }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'solicitudes' || activeTab === 'dashboard') {
      cargarSolicitudes();
    }
  }, [activeTab]);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const response = await solicitudAPI.listar();
      setSolicitudes(response.data.data || []);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'asignada': return 'bg-blue-100 text-blue-800';
      case 'en_proceso': return 'bg-purple-100 text-purple-800';
      case 'completada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (activeTab === 'nueva-solicitud') {
    return <SolicitudForm onSuccess={cargarSolicitudes} />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">¡Hola Cliente! 👋</h1>
        <p className="text-blue-100">Gestiona tus solicitudes de agua de manera fácil y rápida</p>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Solicitudes</p>
                  <p className="text-2xl font-bold text-gray-800">{solicitudes.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {solicitudes.filter(s => s.estado === 'pendiente').length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Completadas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {solicitudes.filter(s => s.estado === 'completada').length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Solicitudes */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h3 className="text-lg font-semibold mb-4">Últimas Solicitudes</h3>
            {loading ? (
              <div className="text-center py-4">🔄 Cargando...</div>
            ) : solicitudes.length > 0 ? (
              <div className="space-y-3">
                {solicitudes.slice(0, 3).map((solicitud) => (
                  <div key={solicitud.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium">Solicitud #{solicitud.id}</p>
                      <p className="text-sm text-gray-500">{solicitud.cantidad_litros}L - {solicitud.tipo_solicitud}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(solicitud.estado)}`}>
                      {solicitud.estado}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No tienes solicitudes aún</p>
            )}
          </div>
        </>
      )}

      {activeTab === 'solicitudes' && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <h3 className="text-lg font-semibold mb-4">Todas mis Solicitudes</h3>
          {loading ? (
            <div className="text-center py-8">🔄 Cargando solicitudes...</div>
          ) : solicitudes.length > 0 ? (
            <div className="space-y-4">
              {solicitudes.map((solicitud) => (
                <div key={solicitud.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Solicitud #{solicitud.id}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(solicitud.estado)}`}>
                      {solicitud.estado}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Cantidad</p>
                      <p className="font-medium">{solicitud.cantidad_litros}L</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tipo</p>
                      <p className="font-medium capitalize">{solicitud.tipo_solicitud}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fecha</p>
                      <p className="font-medium">{new Date(solicitud.fecha_solicitud).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Límite</p>
                      <p className="font-medium">{solicitud.fecha_limite ? new Date(solicitud.fecha_limite).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  {solicitud.descripcion && (
                    <p className="text-sm text-gray-600 mt-2">{solicitud.descripcion}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tienes solicitudes aún</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
              >
                Crear primera solicitud
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClienteDashboard;