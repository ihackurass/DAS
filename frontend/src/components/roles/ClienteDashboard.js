// src/components/roles/ClienteDashboard.js
import React, { useState, useEffect } from 'react';
import { solicitudAPI } from '../../services/api';
import SolicitudForm from '../SolicitudForm';
import AsignacionDetails from '../AsignacionDetails';
import TicketStatus from '../TicketStatus'; // ← NUEVO IMPORT
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

  // ← NUEVA FUNCIÓN: Verificar si tiene ticket
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

            {/* ← NUEVA CARD: Con Ticket */}
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

          {/* Recent Solicitudes - ACTUALIZADO */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h3 className="text-lg font-semibold mb-4">Últimas Solicitudes</h3>
            {loading ? (
              <div className="text-center py-4">🔄 Cargando...</div>
            ) : solicitudes.length > 0 ? (
              <div className="space-y-4">
                {solicitudes.slice(0, 3).map((solicitud) => (
                  <div key={solicitud.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getEstadoIcon(solicitud.estado)}</span>
                        <div>
                          <p className="font-medium">Solicitud #{solicitud.id}</p>
                          <p className="text-sm text-gray-500">{solicitud.cantidad_litros}L - {solicitud.tipo_solicitud}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(solicitud.estado)}`}>
                          {solicitud.estado}
                        </span>
                        {puedeVerDetalles(solicitud.estado) && (
                          <button
                            onClick={() => handleVerDetalles(solicitud.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                          >
                            Ver Detalles
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* ← NUEVA SECCIÓN: Mostrar estado del ticket si existe */}
                    {tieneTicket(solicitud.estado) && (
                      <div className="mt-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3">
                        <TicketStatus solicitudId={solicitud.id} compact={true} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No tienes solicitudes aún</p>
            )}
          </div>

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
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getEstadoIcon(solicitud.estado)}</span>
                      <h4 className="font-medium">Solicitud #{solicitud.id}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(solicitud.estado)}`}>
                        {solicitud.estado}
                      </span>
                      {puedeVerDetalles(solicitud.estado) && (
                        <button
                          onClick={() => handleVerDetalles(solicitud.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                        >
                          <span>📍</span>
                          <span>Ver Dirección</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Grid de información */}
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
                      <p className="font-medium">
                        {solicitud.fecha_limite ? new Date(solicitud.fecha_limite).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Descripción si existe */}
                  {solicitud.descripcion && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Descripción:</span> {solicitud.descripcion}
                      </p>
                    </div>
                  )}

                  {/* ← NUEVA SECCIÓN: Estado del ticket expandido */}
                  {tieneTicket(solicitud.estado) && (
                    <div className="mt-4">
                      <TicketStatus solicitudId={solicitud.id} compact={false} />
                    </div>
                  )}

                  {/* Indicador visual mejorado para solicitudes asignadas */}
                  {puedeVerDetalles(solicitud.estado) && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600 text-lg">📍</span>
                          <div>
                            <p className="text-sm font-medium text-blue-800">
                              {solicitud.estado === 'asignada' ? 'Localidad asignada - Ticket generado' : 
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
    </div>
  );
};

export default ClienteDashboard;