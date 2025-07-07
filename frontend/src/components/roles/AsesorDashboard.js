// src/components/roles/AsesorDashboard.js - VERSIÓN 10
import React, { useState, useEffect } from 'react';
import { solicitudAPI, localidadAPI } from '../../services/api';
import AsignarLocalidadModal from '../AsignarLocalidadModal';

const AsesorDashboard = ({ activeTab }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

  useEffect(() => {
    // Siempre cargar solicitudes pendientes
    cargarSolicitudesPendientes();
    
    // Solo cargar localidades si está en esa pestaña
    if (activeTab === 'localidades') {
      cargarLocalidades();
    }
  }, [activeTab]);

  const cargarSolicitudesPendientes = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔄 Cargando solicitudes pendientes...');
      const response = await solicitudAPI.listar();
      console.log('📦 Respuesta API solicitudes:', response.data);
      
      // Filtrar solo las pendientes
      const pendientes = (response.data.data || []).filter(s => s.estado === 'pendiente');
      console.log('⏳ Solicitudes pendientes encontradas:', pendientes);
      
      setSolicitudes(pendientes);
    } catch (err) {
      console.error('❌ Error cargando solicitudes:', err);
      setError('Error cargando solicitudes pendientes');
    } finally {
      setLoading(false);
    }
  };

  const cargarLocalidades = async () => {
    setLoading(true);
    try {
      console.log('🔄 Cargando localidades...');
      const response = await localidadAPI.listar();
      console.log('🏢 Respuesta API localidades:', response.data);
      
      setLocalidades(response.data.data || []);
    } catch (err) {
      console.error('❌ Error cargando localidades:', err);
      setError('Error cargando localidades');
    } finally {
      setLoading(false);
    }
  };

  const asignarLocalidad = async (solicitud) => {
    console.log('🔍 Función asignarLocalidad llamada con:', solicitud);
    console.log('📋 ID de solicitud:', solicitud.id);
    console.log('💧 Cantidad litros:', solicitud.cantidad_litros);
    
    setSolicitudSeleccionada(solicitud);
    console.log('✅ Modal debería abrirse ahora');
  };

  const handleAsignacionExitosa = () => {
    console.log('🎉 Asignación exitosa, cerrando modal y recargando');
    setSolicitudSeleccionada(null);
    cargarSolicitudesPendientes(); // Recargar la lista
  };

  if (activeTab === 'localidades') {
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">📍 Puntos de Agua</h1>
          <p className="text-orange-100">Localidades disponibles para asignación</p>
        </div>

        {/* Lista de Localidades */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <h3 className="text-lg font-semibold mb-4">🏢 Todas las Localidades</h3>
          
          {loading ? (
            <div className="text-center py-8">🔄 Cargando localidades...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">❌ {error}</div>
          ) : localidades.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {localidades.map((localidad) => (
                <div key={localidad.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">{localidad.nombre}</h4>
                      <p className="text-sm text-gray-600 mb-2">{localidad.direccion}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      localidad.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {localidad.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disponible:</span>
                      <span className="font-medium text-blue-600">{localidad.disponibilidad}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacidad:</span>
                      <span className="font-medium text-gray-800">{localidad.capacidad_maxima}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ocupación:</span>
                      <span className={`font-medium ${
                        (localidad.disponibilidad / localidad.capacidad_maxima) > 0.7 ? 'text-green-600' :
                        (localidad.disponibilidad / localidad.capacidad_maxima) > 0.3 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {Math.round((localidad.disponibilidad / localidad.capacidad_maxima) * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Encargado:</span> {localidad.encargado_nombre || 'Sin asignar'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">🏢</span>
              <p className="text-gray-500">No hay localidades registradas</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Por defecto mostrar solicitudes pendientes
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">⏳ Asignar Solicitudes</h1>
        <p className="text-orange-100">Solicitudes pendientes de asignación</p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{solicitudes.length}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Urgentes</p>
              <p className="text-2xl font-bold text-red-600">
                {solicitudes.filter(s => s.tipo_solicitud === 'urgente').length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <span className="text-2xl">🚨</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Normales</p>
              <p className="text-2xl font-bold text-blue-600">
                {solicitudes.filter(s => s.tipo_solicitud === 'normal').length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">💧</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Comerciales</p>
              <p className="text-2xl font-bold text-purple-600">
                {solicitudes.filter(s => s.tipo_solicitud === 'comercial').length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-2xl">🏢</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Solicitudes Pendientes */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
        <h3 className="text-lg font-semibold mb-4">📋 Solicitudes para Asignar</h3>
        
        {loading ? (
          <div className="text-center py-8">🔄 Cargando solicitudes...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">❌ {error}</div>
        ) : solicitudes.length > 0 ? (
          <div className="space-y-4">
            {solicitudes.map((solicitud) => (
              <div key={solicitud.id} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">
                      {solicitud.tipo_solicitud === 'urgente' ? '🚨' : 
                       solicitud.tipo_solicitud === 'comercial' ? '🏢' : '💧'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-semibold text-gray-800">
                          {solicitud.cantidad_litros}L
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          solicitud.tipo_solicitud === 'urgente' ? 'bg-red-100 text-red-800' :
                          solicitud.tipo_solicitud === 'comercial' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {solicitud.tipo_solicitud}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Solicitado el {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                      </p>
                      {solicitud.descripcion && (
                        <p className="text-sm text-gray-500 mt-1">
                          {solicitud.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <button
                      onClick={() => {
                        console.log('🔘 BOTÓN CLICKEADO! Solicitud:', solicitud);
                        console.log('📋 ID:', solicitud.id);
                        console.log('💧 Litros:', solicitud.cantidad_litros);
                        asignarLocalidad(solicitud);
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      📍 Asignar Localidad
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {solicitud.id}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">🎉</span>
            <p className="text-gray-500 mb-4">¡No hay solicitudes pendientes!</p>
            <p className="text-sm text-gray-400">Todas las solicitudes han sido asignadas</p>
          </div>
        )}
      </div>

      {/* Debug: Mostrar estado del modal */}
      {solicitudSeleccionada && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-lg z-50">
          <p className="text-sm">🔍 Modal debería estar abierto</p>
          <p className="text-xs">Solicitud ID: {solicitudSeleccionada.id}</p>
        </div>
      )}

      {/* Modal de Asignación */}
      {solicitudSeleccionada && (
        <AsignarLocalidadModal
          solicitud={solicitudSeleccionada}
          onClose={() => {
            console.log('🚪 Cerrando modal');
            setSolicitudSeleccionada(null);
          }}
          onSuccess={handleAsignacionExitosa}
        />
      )}
    </div>
  );
};

export default AsesorDashboard;