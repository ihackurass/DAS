// frontend/src/components/AsignacionDetails.js
import React, { useState, useEffect } from 'react';
import { solicitudAPI } from '../services/api';

const AsignacionDetails = ({ solicitudId, onClose }) => {
  const [asignacion, setAsignacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarAsignacion = async () => {
      try {
        console.log('🔍 Cargando asignación para solicitud:', solicitudId);
        const response = await solicitudAPI.obtenerAsignacion(solicitudId);
        console.log('✅ Asignación cargada:', response.data);
        setAsignacion(response.data.data);
      } catch (err) {
        console.error('❌ Error cargando asignación:', err);
        setError('Error al cargar detalles de asignación');
      } finally {
        setLoading(false);
      }
    };

    if (solicitudId) {
      cargarAsignacion();
    }
  }, [solicitudId]);

  // ← NUEVA FUNCIÓN: Obtener color del estado del ticket
  const getTicketStatusColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'en_proceso': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'entregado': return 'bg-green-100 text-green-800 border-green-200';
      case 'parcial': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // ← NUEVA FUNCIÓN: Obtener icono del estado
  const getTicketStatusIcon = (estado) => {
    switch (estado) {
      case 'pendiente': return '⏳';
      case 'en_proceso': return '🚛';
      case 'entregado': return '✅';
      case 'parcial': return '📦';
      case 'cancelado': return '❌';
      default: return '🎫';
    }
  };

  // ← NUEVA FUNCIÓN: Obtener mensaje del estado
  const getTicketStatusMessage = (estado) => {
    switch (estado) {
      case 'pendiente': return 'Listo para recoger. Dirígete a la localidad cuando puedas.';
      case 'en_proceso': return 'Estás siendo atendido. El proceso de entrega está en curso.';
      case 'entregado': return '¡Entrega completada exitosamente!';
      case 'parcial': return 'Entrega parcial realizada. Contacta al asesor para el resto.';
      case 'cancelado': return 'Entrega cancelada. Contacta al asesor para más información.';
      default: return 'Estado del ticket no disponible.';
    }
  };

  // ← NUEVA FUNCIÓN: Copiar código al portapapeles
  const copyToClipboard = (texto) => {
    navigator.clipboard.writeText(texto).then(() => {
      // Aquí podrías agregar una notificación de éxito
      console.log('✅ Código copiado al portapapeles');
    }).catch(() => {
      console.log('❌ Error al copiar código');
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando detalles...</p>
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
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!asignacion) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No se encontraron detalles de asignación</p>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { solicitud, asignacion: detallesAsignacion, ticket } = asignacion;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📋 Detalles de Solicitud #{solicitud.id}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* ← NUEVA SECCIÓN: Ticket prominente */}
        {ticket && (
          <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getTicketStatusIcon(ticket.estado)}</span>
                <div>
                  <h3 className="text-xl font-bold">Tu Ticket de Retiro</h3>
                  <p className="text-indigo-100">Presenta este código en la localidad</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getTicketStatusColor(ticket.estado)}`}>
                {ticket.estado.toUpperCase()}
              </div>
            </div>
            
            {/* Código del ticket - muy prominente */}
            <div className="bg-white/20 backdrop-blur rounded-xl p-4 mb-4">
              <div className="text-center">
                <p className="text-indigo-200 text-sm mb-1">Código de Ticket</p>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-3xl font-mono font-bold tracking-wider">
                    {ticket.codigo}
                  </span>
                  <button
                    onClick={() => copyToClipboard(ticket.codigo)}
                    className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
                    title="Copiar código"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>

            {/* Estado y mensaje */}
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-sm text-indigo-100">
                {getTicketStatusMessage(ticket.estado)}
              </p>
              {ticket.fecha_llegada && (
                <p className="text-xs text-indigo-200 mt-1">
                  Llegada registrada: {new Date(ticket.fecha_llegada).toLocaleString()}
                </p>
              )}
              {ticket.cantidad_entregada && (
                <p className="text-xs text-indigo-200 mt-1">
                  Cantidad entregada: {ticket.cantidad_entregada} litros
                </p>
              )}
            </div>
          </div>
        )}

        {/* Información de la solicitud */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">💧 Información de Solicitud</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Cantidad:</span>
              <p className="font-semibold">{solicitud.cantidad_litros} litros</p>
            </div>
            <div>
              <span className="text-gray-600">Tipo:</span>
              <p className="font-semibold capitalize">{solicitud.tipo_solicitud}</p>
            </div>
            <div>
              <span className="text-gray-600">Estado:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                solicitud.estado === 'asignada' ? 'bg-yellow-100 text-yellow-800' :
                solicitud.estado === 'completada' ? 'bg-green-100 text-green-800' :
                solicitud.estado === 'en_proceso' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {solicitud.estado}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Fecha:</span>
              <p className="font-semibold">
                {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
              </p>
            </div>
          </div>
          {solicitud.descripcion && (
            <div className="mt-3">
              <span className="text-gray-600">Descripción:</span>
              <p className="text-gray-800">{solicitud.descripcion}</p>
            </div>
          )}
        </div>

        {/* Detalles de asignación */}
        {detallesAsignacion && (
          <div className="space-y-6">
            {/* Dirección asignada */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                📍 Dirección de Retiro
              </h3>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-800">
                  {detallesAsignacion.localidad.nombre}
                </p>
                <p className="text-gray-700">
                  {detallesAsignacion.localidad.direccion}
                </p>
                {detallesAsignacion.localidad.telefono && (
                  <p className="text-gray-600">
                    📞 {detallesAsignacion.localidad.telefono}
                  </p>
                )}
              </div>
            </div>

            {/* Comentario del asesor */}
            {detallesAsignacion.comentario_asesor && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  💬 Instrucciones del Asesor
                </h3>
                <p className="text-gray-700 italic">
                  "{detallesAsignacion.comentario_asesor}"
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  - {detallesAsignacion.asesor.nombre}
                </p>
              </div>
            )}

            {/* Información de contacto */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-3">👥 Contactos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Asesor asignado:</span>
                  <p className="font-semibold">{detallesAsignacion.asesor.nombre}</p>
                  {detallesAsignacion.asesor.telefono && (
                    <p className="text-gray-600">📞 {detallesAsignacion.asesor.telefono}</p>
                  )}
                </div>
                <div>
                  <span className="text-gray-600">Encargado de localidad:</span>
                  <p className="font-semibold">{detallesAsignacion.encargado.nombre}</p>
                  {detallesAsignacion.encargado.telefono && (
                    <p className="text-gray-600">📞 {detallesAsignacion.encargado.telefono}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Fecha de asignación */}
            <div className="text-center text-sm text-gray-500">
              Asignado el {new Date(detallesAsignacion.fecha_asignacion).toLocaleString()}
            </div>
          </div>
        )}

        {/* Si no hay asignación, mostrar mensaje */}
        {!detallesAsignacion && (
          <div className="text-center py-8">
            <p className="text-gray-500">Esta solicitud aún no ha sido asignada a ninguna localidad.</p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3 mt-6">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
          >
            Cerrar
          </button>
          {detallesAsignacion && (
            <>
              {/* ← NUEVO BOTÓN: Copiar código */}
              {ticket && (
                <button
                  onClick={() => copyToClipboard(ticket.codigo)}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                >
                  📋 Copiar Código
                </button>
              )}
              {/* Botón de mapa existente */}
              <button 
                onClick={() => {
                  const direccion = encodeURIComponent(detallesAsignacion.localidad.direccion);
                  window.open(`https://maps.google.com/?q=${direccion}`, '_blank');
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
              >
                🗺️ Ver en Mapa
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AsignacionDetails;