// src/components/EstadisticasDashboard.js
import React, { useState, useEffect } from 'react';
import { estadisticasAPI } from '../services/api';

const EstadisticasDashboard = ({ onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const response = await estadisticasAPI.dashboard();
      setStats(response.data.data);
    } catch (err) {
      setError('Error al cargar estadísticas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando estadísticas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-2">
              <button 
                onClick={cargarEstadisticas}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Reintentar
              </button>
              <button 
                onClick={onClose}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const getSolicitudPorcentaje = (estado) => {
    const total = stats.solicitudes_por_estado.reduce((sum, item) => sum + parseInt(item.cantidad), 0);
    const item = stats.solicitudes_por_estado.find(s => s.estado === estado);
    return total > 0 ? Math.round((parseInt(item?.cantidad || 0) / total) * 100) : 0;
  };

  const getTicketPorcentaje = (estado) => {
    const total = stats.tickets_por_estado.reduce((sum, item) => sum + parseInt(item.cantidad), 0);
    const item = stats.tickets_por_estado.find(t => t.estado_entrega === estado);
    return total > 0 ? Math.round((parseInt(item?.cantidad || 0) / total) * 100) : 0;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📊 Estadísticas del Sistema
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Actividad de Hoy */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">🌅 Actividad de Hoy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.actividad_hoy.solicitudes}</div>
              <div className="text-gray-600">Solicitudes Nuevas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.actividad_hoy.entregas}</div>
              <div className="text-gray-600">Entregas Completadas</div>
            </div>
          </div>
        </div>

        {/* Grid de estadísticas principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Solicitudes por Estado */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">📋 Solicitudes por Estado</h3>
            <div className="space-y-3">
              {stats.solicitudes_por_estado.map((item) => (
                <div key={item.estado} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${
                      item.estado === 'pendiente' ? 'bg-yellow-500' :
                      item.estado === 'asignada' ? 'bg-blue-500' :
                      item.estado === 'en_proceso' ? 'bg-purple-500' :
                      item.estado === 'completada' ? 'bg-green-500' :
                      'bg-red-500'
                    }`}></span>
                    <span className="capitalize font-medium">{item.estado}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{item.cantidad}</div>
                    <div className="text-xs text-gray-500">{getSolicitudPorcentaje(item.estado)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tickets por Estado */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">🎫 Tickets por Estado</h3>
            <div className="space-y-3">
              {stats.tickets_por_estado.map((item) => (
                <div key={item.estado_entrega} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${
                      item.estado_entrega === 'pendiente' ? 'bg-yellow-500' :
                      item.estado_entrega === 'en_proceso' ? 'bg-blue-500' :
                      item.estado_entrega === 'entregado' ? 'bg-green-500' :
                      item.estado_entrega === 'parcial' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}></span>
                    <span className="capitalize font-medium">{item.estado_entrega}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{item.cantidad}</div>
                    <div className="text-xs text-gray-500">{getTicketPorcentaje(item.estado_entrega)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Localidades */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">🏢 Localidades</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-bold">{stats.localidades.total_localidades}</span>
              </div>
              <div className="flex justify-between">
                <span>Disponibilidad Total:</span>
                <span className="font-bold">{Math.round(stats.localidades.disponibilidad_total)}L</span>
              </div>
              <div className="flex justify-between">
                <span>Capacidad Total:</span>
                <span className="font-bold">{Math.round(stats.localidades.capacidad_total)}L</span>
              </div>
              <div className="flex justify-between">
                <span>Promedio Disponible:</span>
                <span className="font-bold">{Math.round(stats.localidades.promedio_disponibilidad)}L</span>
              </div>
            </div>
          </div>

          {/* Usuarios */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">👥 Usuarios</h3>
            <div className="space-y-2">
              {stats.usuarios_por_rol.map((item) => (
                <div key={item.rol} className="flex justify-between">
                  <span className="capitalize">{item.rol}s:</span>
                  <span className="font-bold">{item.cantidad}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Última actualización */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">🕐 Información</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Última actualización:</span>
                <div className="font-medium">
                  {new Date(stats.fecha_consulta).toLocaleString()}
                </div>
              </div>
              <button 
                onClick={cargarEstadisticas}
                className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Top Localidades */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">🏆 Top Localidades Más Demandadas</h3>
          <div className="space-y-3">
            {stats.top_localidades.map((localidad, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-amber-600' :
                    'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{localidad.nombre}</div>
                    <div className="text-sm text-gray-500">{localidad.direccion}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{localidad.total_asignaciones} asignaciones</div>
                  <div className="text-sm text-gray-500">{Math.round(localidad.litros_totales || 0)}L entregados</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón de cerrar */}
        <div className="mt-6 text-center">
          <button 
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-8 rounded-xl font-semibold transition-colors"
          >
            Cerrar Estadísticas
          </button>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasDashboard;