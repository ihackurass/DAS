import React, { useState } from 'react';
import { solicitudAPI } from '../services/api';

const SolicitudAsignadaCard = ({ solicitud, onUpdate, onPreview }) => {
  const [loading, setLoading] = useState(false);
  const [showTicketInput, setShowTicketInput] = useState(false);
  const [codigoTicket, setCodigoTicket] = useState('');
  const [error, setError] = useState('');

  const handleAceptar = async () => {
    setLoading(true);
    setError('');
    try {
      await solicitudAPI.cambiarEstado(solicitud.id, 'aceptar');
      onUpdate(); // Recargar lista
    } catch (error) {
      console.error('Error aceptando solicitud:', error);
      setError('Error al aceptar la asignación');
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!window.confirm('¿Estás seguro de rechazar esta asignación?')) return;
    
    setLoading(true);
    setError('');
    try {
      await solicitudAPI.cambiarEstado(solicitud.id, 'rechazar');
      onUpdate(); // Recargar lista
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
      setError('Error al rechazar la asignación');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarRecogida = async () => {
    if (!codigoTicket.trim()) {
      setError('Ingresa el código del ticket');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await solicitudAPI.cambiarEstado(solicitud.id, 'recoger', { codigo_ticket: codigoTicket });
      setShowTicketInput(false);
      setCodigoTicket('');
      onUpdate(); // Recargar lista
    } catch (error) {
      console.error('Error confirmando recogida:', error);
      setError('Código de ticket inválido');
    } finally {
      setLoading(false);
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'urgente': return '🚨';
      case 'normal': return '💧';
      case 'comercial': return '🏢';
      default: return '💧';
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{getTipoIcon(solicitud.tipo_solicitud)}</span>
          <div>
            <h4 className="font-semibold text-lg">Solicitud #{solicitud.id}</h4>
            <p className="text-sm text-gray-500">
              Creada el {formatearFecha(solicitud.fecha_solicitud)}
            </p>
          </div>
        </div>
        <button
          onClick={() => onPreview(solicitud.id)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          👁️ Ver detalles
        </button>
      </div>

      {/* Información básica */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">CANTIDAD</p>
          <p className="font-semibold text-lg">{solicitud.cantidad_litros}L</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">TIPO</p>
          <p className="font-semibold capitalize">{solicitud.tipo_solicitud}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">ESTADO</p>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(solicitud.estado)}`}>
            {solicitud.estado.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Localidad asignada */}
      {solicitud.localidad && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
            📍 Localidad Asignada
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-blue-600">Nombre:</p>
              <p className="font-medium">{solicitud.localidad.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Dirección:</p>
              <p className="font-medium">{solicitud.localidad.direccion}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Disponibilidad:</p>
              <p className="font-medium text-green-600">{solicitud.localidad.disponibilidad?.toLocaleString()}L</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Encargado:</p>
              <p className="font-medium">{solicitud.localidad.encargado?.nombre || 'No asignado'}</p>
            </div>
          </div>
          {solicitud.observaciones && (
            <div className="mt-3">
              <p className="text-sm text-blue-600">Observaciones del asesor:</p>
              <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                {solicitud.observaciones}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Acciones según estado */}
      <div className="border-t border-gray-100 pt-4">
        {solicitud.estado === 'asignada' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-3">
              ¿Aceptas ir a recoger el agua en esta localidad?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleAceptar}
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? '⏳' : '✅'} Aceptar Dirección
              </button>
              <button
                onClick={handleRechazar}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? '⏳' : '❌'} Rechazar
              </button>
            </div>
          </div>
        )}

        {solicitud.estado === 'aceptada' && (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <p className="text-green-800 font-medium">✅ Dirección aceptada</p>
              <p className="text-green-700 text-sm">Ve al local y solicita tu código de ticket</p>
            </div>
            
            {!showTicketInput ? (
              <button
                onClick={() => setShowTicketInput(true)}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                🎫 Ya tengo el código - Confirmar recogida
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código del ticket:
                  </label>
                  <input
                    type="text"
                    value={codigoTicket}
                    onChange={(e) => setCodigoTicket(e.target.value.toUpperCase())}
                    placeholder="Ej: TKT-000123-20250706"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleConfirmarRecogida}
                    disabled={loading}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? '⏳ Verificando...' : '🎫 Confirmar Recogida'}
                  </button>
                  <button
                    onClick={() => {
                      setShowTicketInput(false);
                      setCodigoTicket('');
                      setError('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {solicitud.estado === 'recogida' && (
          <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
            <p className="text-purple-800 font-medium">🎫 Agua recogida exitosamente</p>
            <p className="text-purple-700 text-sm">
              Recogido el {solicitud.fecha_recogida ? formatearFecha(solicitud.fecha_recogida) : 'Fecha no disponible'}
            </p>
            {solicitud.codigo_ticket && (
              <p className="text-purple-600 text-xs font-mono mt-1">
                Código: {solicitud.codigo_ticket}
              </p>
            )}
          </div>
        )}

        {solicitud.estado === 'rechazada' && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <p className="text-red-800 font-medium">❌ Asignación rechazada</p>
            <p className="text-red-700 text-sm">Un asesor te asignará una nueva localidad</p>
          </div>
        )}
      </div>
    </div>
  );
};

const getEstadoColor = (estado) => {
  switch (estado) {
    case 'pendiente': return 'bg-yellow-100 text-yellow-800';
    case 'asignada': return 'bg-blue-100 text-blue-800';
    case 'aceptada': return 'bg-green-100 text-green-800';
    case 'recogida': return 'bg-purple-100 text-purple-800';
    case 'rechazada': return 'bg-red-100 text-red-800';
    case 'cancelada': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default SolicitudAsignadaCard;