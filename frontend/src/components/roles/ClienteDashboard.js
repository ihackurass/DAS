// src/components/roles/ClienteDashboard.js
import React, { useState, useEffect } from 'react';
import { solicitudAPI } from '../../services/api';
import SolicitudForm from '../SolicitudForm';
import AsignacionDetails from '../AsignacionDetails';
import TicketStatus from '../TicketStatus';
import EstadisticasDashboard from '../EstadisticasDashboard'; // ← NUEVO IMPORT

const ClienteDashboard = ({ activeTab }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [showStats, setShowStats] = useState(false); // ← NUEVO STATE

  useEffect(() => {
    if (activeTab === 'solicitudes' || activeTab === 'dashboard') {
      cargarSolicitudes();
    }
  }, [activeTab]);

  useEffect(() => {
    if (showStats) {
      const timer = setTimeout(() => {
        setShowStats(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showStats]);
  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const response = await solicitudAPI.listar();
      console.log('📋 Solicitudes cargadas:', response.data);
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

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente': return '⏳';
      case 'asignada': return '📍';
      case 'en_proceso': return '🚛';
      case 'completada': return '✅';
      case 'cancelada': return '❌';
      default: return '📋';
    }
  };

  const puedeVerDetalles = (estado) => {
    return ['asignada', 'en_proceso', 'completada'].includes(estado);
  };

  const tieneTicket = (estado) => {
    return ['asignada', 'en_proceso', 'completada'].includes(estado);
  };

  const handleVerDetalles = (solicitudId) => {
    console.log('🔍 Ver detalles de solicitud:', solicitudId);
    setSelectedSolicitud(solicitudId);
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  <p className="text-gray-500 text-sm">Con Ticket</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {solicitudes.filter(s => tieneTicket(s.estado)).length}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <span className="text-2xl">🎫</span>
                </div>
              </div>
            </div>

            {/* ← NUEVA CARD: Ver Estadísticas */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Estadísticas</p>
                  <p className="text-sm font-medium text-gray-800">Ver Completas</p>
                </div>
                <button
                  onClick={() => setShowStats(true)}
                  className="bg-purple-100 hover:bg-purple-200 p-3 rounded-full transition-colors"
                >
                  <span className="text-2xl">📊</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Solicitudes */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h3 className="text-lg font-semibold mb-4">Últimas Solicitudes</h3>
            {loading ? (
              <div className="text-center py-8">🔄 Cargando solicitudes...</div>
            ) : solicitudes.length > 0 ? (
              <div className="space-y-4">
                {solicitudes.slice(0, 3).map((solicitud) => (
                  <div key={solicitud.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{getEstadoIcon(solicitud.estado)}</span>
                      <div>
                        <p className="font-medium">{solicitud.cantidad_litros}L</p>
                        <p className="text-sm text-gray-500">
                          {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(solicitud.estado)}`}>
                        {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                      </span>
                      {puedeVerDetalles(solicitud.estado) && (
                        <button
                          onClick={() => handleVerDetalles(solicitud.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600 transition-colors"
                        >
                          Ver Ticket
                        </button>
                      )}
                    </div>
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
                <div key={solicitud.id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{getEstadoIcon(solicitud.estado)}</span>
                      <div>
                        <p className="font-medium text-lg">{solicitud.cantidad_litros}L</p>
                        <p className="text-sm text-gray-500">
                          Solicitado el {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(solicitud.estado)}`}>
                        {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                      </span>
                      {puedeVerDetalles(solicitud.estado) && (
                        <button
                          onClick={() => handleVerDetalles(solicitud.id)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Ver Detalles
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {tieneTicket(solicitud.estado) && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            {solicitud.estado === 'asignada' ? 
                              'Localidad asignada - Ticket generado' : 
                              solicitud.estado === 'en_proceso' ? 'En proceso de entrega' : 
                              'Entrega completada'}
                          </p>
                          <p className="text-xs text-blue-600">
                            Haz clic en "Ver Dirección" para ver tu ticket y dirección
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleVerDetalles(solicitud.id)}
                        className="bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                      >
                        Ver Ticket
                      </button>
                    </div>
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

      {/* Modal de detalles */}
      {selectedSolicitud && (
        <AsignacionDetails 
          solicitudId={selectedSolicitud}
          onClose={() => {
            console.log('🚪 Cerrando modal');
            setSelectedSolicitud(null);
          }}
        />
      )}

    {/* Modal de Estadísticas */}
    {showStats && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header del modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">📊 Estadísticas del Sistema</h2>
          <div className="text-sm text-gray-500">Se cerrará automáticamente en 5 segundos</div>
        </div>
        
        {/* Contenido del modal */}
        <div className="flex-1 overflow-y-auto p-6">
          <EstadisticasDashboard />
        </div>
      </div>
    </div>
    )}
    </div>
  );
};

export default ClienteDashboard;