// src/components/AsignarLocalidadModal.js
import React, { useState, useEffect } from 'react';
import { localidadAPI, solicitudAPI } from '../services/api';

const AsignarLocalidadModal = ({ solicitud, onClose, onSuccess }) => {
  const [localidades, setLocalidades] = useState([]);
  const [localidadSeleccionada, setLocalidadSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [asignando, setAsignando] = useState(false);
  const [estrategia, setEstrategia] = useState('cercana');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    cargarLocalidades();
  }, []);

  const cargarLocalidades = async () => {
    setLoading(true);
    try {
      const response = await localidadAPI.listar();
      const localidadesActivas = (response.data.data || []).filter(l => 
        l.activo && l.disponibilidad >= solicitud.cantidad_litros
      );
      setLocalidades(localidadesActivas);
    } catch (error) {
      console.error('❌ Error cargando localidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const asignarLocalidad = async () => {
    if (!localidadSeleccionada) {
      alert('Debes seleccionar una localidad');
      return;
    }

    setAsignando(true);
    try {
      // Llamar a la API para asignar
      await solicitudAPI.asignar(solicitud.id, {
        localidad_id: localidadSeleccionada.id,
        asesor_id: 1, // Por ahora hardcodeado, después usar user.id
        observaciones: observaciones || `Asignación automática usando estrategia: ${estrategia}`,
        estrategia_utilizada: estrategia
      });

      console.log('✅ Localidad asignada exitosamente');
      onSuccess();
    } catch (error) {
      console.error('❌ Error asignando localidad:', error);
      alert('Error al asignar localidad. Intenta nuevamente.');
    } finally {
      setAsignando(false);
    }
  };

  const getEstrategiaColor = (estrategiaParam) => {
    switch (estrategiaParam) {
      case 'cercana': return 'bg-blue-100 text-blue-800';
      case 'capacidad': return 'bg-green-100 text-green-800';
      case 'rapida': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ordenarLocalidades = () => {
    const localidadesOrdenadas = [...localidades];
    
    switch (estrategia) {
      case 'cercana':
        // Simular distancias fijas basadas en el ID de la localidad
        return localidadesOrdenadas.sort((a, b) => {
          // Generar distancia simulada consistente basada en ID
          const distanciaA = ((a.id * 7) % 20) + 1; // Distancia entre 1-20 km
          const distanciaB = ((b.id * 7) % 20) + 1;
          return distanciaA - distanciaB;
        });
      
      case 'capacidad':
        return localidadesOrdenadas.sort((a, b) => b.disponibilidad - a.disponibilidad);
      
      case 'rapida':
        // Simular tiempo de atención basado en capacidad y nombre
        return localidadesOrdenadas.sort((a, b) => {
          // Localidades con menos capacidad = más rápidas (menos cola)
          const tiempoA = Math.floor(a.capacidad_maxima / 1000) + (a.nombre.length % 3); // Tiempo simulado
          const tiempoB = Math.floor(b.capacidad_maxima / 1000) + (b.nombre.length % 3);
          return tiempoA - tiempoB;
        });
      
      default:
        return localidadesOrdenadas;
    }
  };

  // Función para obtener información de ordenamiento
  const getInfoOrdenamiento = (localidad) => {
    switch (estrategia) {
      case 'cercana':
        const distancia = ((localidad.id * 7) % 20) + 1;
        return { valor: `${distancia} km`, color: 'text-blue-600', icon: '📍' };
      
      case 'capacidad':
        return { valor: `${localidad.disponibilidad}L`, color: 'text-green-600', icon: '💧' };
      
      case 'rapida':
        const tiempo = Math.floor(localidad.capacidad_maxima / 1000) + (localidad.nombre.length % 3);
        return { valor: `${tiempo * 15} min`, color: 'text-orange-600', icon: '⚡' };
      
      default:
        return { valor: '', color: '', icon: '' };
    }
  };

  const localidadesOrdenadas = ordenarLocalidades();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">📍 Asignar Localidad</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Información de la solicitud */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">
              {solicitud.tipo_solicitud === 'urgente' ? '🚨' : 
               solicitud.tipo_solicitud === 'comercial' ? '🏢' : '💧'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                Solicitud #{solicitud.id} - {solicitud.cantidad_litros}L
              </h3>
              <p className="text-sm text-gray-600">
                Tipo: {solicitud.tipo_solicitud} | 
                Fecha: {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
              </p>
              {solicitud.descripcion && (
                <p className="text-sm text-gray-500 mt-1">{solicitud.descripcion}</p>
              )}
            </div>
          </div>
        </div>

        {/* Estrategia de asignación */}
        <div className="p-6 border-b border-gray-200">
          <h4 className="font-semibold mb-3">🎯 Estrategia de Asignación</h4>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setEstrategia('cercana')}
              className={`p-3 rounded-lg border-2 transition-colors ${
                estrategia === 'cercana' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">📍</div>
                <p className="font-medium text-sm">Más Cercana</p>
                <p className="text-xs text-gray-600">Por ubicación</p>
              </div>
            </button>

            <button
              onClick={() => setEstrategia('capacidad')}
              className={`p-3 rounded-lg border-2 transition-colors ${
                estrategia === 'capacidad' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">💧</div>
                <p className="font-medium text-sm">Mayor Capacidad</p>
                <p className="text-xs text-gray-600">Más disponibilidad</p>
              </div>
            </button>

            <button
              onClick={() => setEstrategia('rapida')}
              className={`p-3 rounded-lg border-2 transition-colors ${
                estrategia === 'rapida' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">⚡</div>
                <p className="font-medium text-sm">Más Rápida</p>
                <p className="text-xs text-gray-600">Menor tiempo</p>
              </div>
            </button>
          </div>
        </div>

        {/* Lista de localidades */}
        <div className="flex-1 overflow-y-auto p-6">
          <h4 className="font-semibold mb-3">
            🏢 Localidades Disponibles 
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getEstrategiaColor(estrategia)}`}>
              Ordenado por: {estrategia}
            </span>
          </h4>
          
          {loading ? (
            <div className="text-center py-8">🔄 Cargando localidades...</div>
          ) : localidadesOrdenadas.length > 0 ? (
            <div className="space-y-3">
              {localidadesOrdenadas.map((localidad, index) => {
                const infoOrden = getInfoOrdenamiento(localidad);
                return (
                  <div
                    key={localidad.id}
                    onClick={() => setLocalidadSeleccionada(localidad)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      localidadSeleccionada?.id === localidad.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-gray-800">{localidad.nombre}</h5>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600`}>
                              #{index + 1}
                            </span>
                            {infoOrden.valor && (
                              <span className={`text-sm font-medium ${infoOrden.color} flex items-center`}>
                                <span className="mr-1">{infoOrden.icon}</span>
                                {infoOrden.valor}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{localidad.direccion}</p>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Disponible:</span>
                            <p className="font-medium text-blue-600">{localidad.disponibilidad}L</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Capacidad:</span>
                            <p className="font-medium text-gray-800">{localidad.capacidad_maxima}L</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Ocupación:</span>
                            <p className={`font-medium ${
                              (localidad.disponibilidad / localidad.capacidad_maxima) > 0.7 ? 'text-green-600' :
                              (localidad.disponibilidad / localidad.capacidad_maxima) > 0.3 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {Math.round((localidad.disponibilidad / localidad.capacidad_maxima) * 100)}%
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {localidadSeleccionada?.id === localidad.id && (
                        <div className="text-orange-500 text-xl ml-4">✓</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">😅</span>
              <p className="text-gray-500 mb-2">No hay localidades disponibles</p>
              <p className="text-sm text-gray-400">
                No hay localidades con suficiente capacidad ({solicitud.cantidad_litros}L)
              </p>
            </div>
          )}
        </div>

        {/* Observaciones */}
        <div className="p-6 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📝 Observaciones (opcional)
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Comentarios adicionales sobre la asignación..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows="2"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={asignarLocalidad}
            disabled={!localidadSeleccionada || asignando}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
          >
            {asignando ? '⏳ Asignando...' : '📍 Asignar Localidad'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AsignarLocalidadModal;