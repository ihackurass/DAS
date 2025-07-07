import React, { useState, useEffect } from 'react';
import { solicitudAPI } from '../services/api';

const SolicitudPreviewModal = ({ isOpen, onClose, solicitudId }) => {
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && solicitudId) {
      cargarDetallesSolicitud();
    }
  }, [isOpen, solicitudId]);

  const cargarDetallesSolicitud = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await solicitudAPI.obtener(solicitudId);
      // Estructura estándar: response.data.data.data
      setSolicitud(response.data.data.data);
    } catch (error) {
      console.error('Error cargando detalles:', error);
      setError('Error al cargar los detalles de la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoInfo = (estado) => {
    switch (estado) {
      case 'pendiente':
        return {
          color: 'bg-yellow-500',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-800',
          icon: '⏳',
          descripcion: 'Tu solicitud está en cola esperando asignación por un asesor'
        };
      case 'asignada':
        return {
          color: 'bg-blue-500',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          icon: '📍',
          descripcion: 'Tu solicitud ha sido asignada a una localidad. Ya puedes recoger el agua'
        };
      case 'en_proceso':
        return {
          color: 'bg-purple-500',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-800',
          icon: '🚛',
          descripcion: 'Tu solicitud está siendo procesada en la localidad'
        };
      case 'completada':
        return {
          color: 'bg-green-500',
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
          icon: '✅',
          descripcion: 'Tu solicitud ha sido completada exitosamente'
        };
      case 'cancelada':
        return {
          color: 'bg-red-500',
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          icon: '❌',
          descripcion: 'Esta solicitud ha sido cancelada'
        };
      default:
        return {
          color: 'bg-gray-500',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          icon: '❓',
          descripcion: 'Estado desconocido'
        };
    }
  };

  const getTipoInfo = (tipo) => {
    switch (tipo) {
      case 'urgente':
        return {
          icon: '🚨',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          limite: '2 horas',
          maxLitros: '1,000L',
          descripcion: 'Solicitud de emergencia con alta prioridad'
        };
      case 'normal':
        return {
          icon: '💧',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          limite: '24 horas',
          maxLitros: '5,000L',
          descripcion: 'Solicitud estándar para uso doméstico'
        };
      case 'comercial':
        return {
          icon: '🏢',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          limite: '3 días',
          maxLitros: 'Ilimitado (min. 1,000L)',
          descripcion: 'Solicitud para uso comercial o empresarial'
        };
      default:
        return {
          icon: '💧',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          limite: 'N/A',
          maxLitros: 'N/A',
          descripcion: 'Tipo de solicitud no definido'
        };
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularTiempoRestante = (fechaLimite) => {
    if (!fechaLimite) return null;
    
    const ahora = new Date();
    const limite = new Date(fechaLimite);
    const diferencia = limite - ahora;
    
    if (diferencia <= 0) {
      return { texto: 'Expirado', color: 'text-red-600', urgent: true };
    }
    
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    if (horas < 2) {
      return { texto: `${horas}h ${minutos}m restantes`, color: 'text-red-600', urgent: true };
    } else if (horas < 12) {
      return { texto: `${horas}h ${minutos}m restantes`, color: 'text-yellow-600', urgent: false };
    } else {
      return { texto: `${horas}h restantes`, color: 'text-green-600', urgent: false };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">💧</div>
              <div>
                <h2 className="text-2xl font-bold">
                  {loading ? 'Cargando...' : `Solicitud #${solicitudId}`}
                </h2>
                <p className="text-blue-100">Detalles completos de tu solicitud</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💧</div>
              <p className="text-gray-500">Cargando detalles de la solicitud...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❌</div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={cargarDetallesSolicitud}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : solicitud ? (
            <div className="space-y-6">
              {/* Estado Actual */}
              <div className={`${getEstadoInfo(solicitud.estado).bgColor} rounded-2xl p-6 border-l-4 ${getEstadoInfo(solicitud.estado).color}`}>
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-3xl">{getEstadoInfo(solicitud.estado).icon}</span>
                  <div>
                    <h3 className={`text-xl font-bold ${getEstadoInfo(solicitud.estado).textColor}`}>
                      Estado: {solicitud.estado.replace('_', ' ').toUpperCase()}
                    </h3>
                    <p className={`${getEstadoInfo(solicitud.estado).textColor} opacity-80`}>
                      {getEstadoInfo(solicitud.estado).descripcion}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información Principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Detalles de la Solicitud */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="text-2xl mr-2">{getTipoInfo(solicitud.tipo_solicitud).icon}</span>
                    Detalles de la Solicitud
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-semibold">#{solicitud.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cantidad:</span>
                      <span className="font-semibold text-blue-600">{solicitud.cantidad_litros}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className={`font-semibold ${getTipoInfo(solicitud.tipo_solicitud).color} capitalize`}>
                        {solicitud.tipo_solicitud}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prioridad:</span>
                      <span className="font-semibold">
                        {solicitud.tipo_solicitud === 'urgente' ? '🔴 Alta' : 
                         solicitud.tipo_solicitud === 'comercial' ? '🟡 Media' : '🟢 Normal'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información de Tiempo */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="text-2xl mr-2">🕒</span>
                    Información de Tiempo
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-600 text-sm">Fecha de creación:</span>
                      <p className="font-semibold">{formatearFecha(solicitud.fecha_solicitud)}</p>
                    </div>
                    {solicitud.fecha_limite && (
                      <div>
                        <span className="text-gray-600 text-sm">Fecha límite:</span>
                        <p className="font-semibold">{formatearFecha(solicitud.fecha_limite)}</p>
                        {calcularTiempoRestante(solicitud.fecha_limite) && (
                          <p className={`text-sm font-medium ${calcularTiempoRestante(solicitud.fecha_limite).color}`}>
                            {calcularTiempoRestante(solicitud.fecha_limite).urgent && '⚠️ '}
                            {calcularTiempoRestante(solicitud.fecha_limite).texto}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Descripción */}
              {solicitud.descripcion && (
                <div className="bg-blue-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <span className="text-2xl mr-2">📝</span>
                    Descripción
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{solicitud.descripcion}</p>
                </div>
              )}

              {/* Información del Asesor (si está asignada) */}
              {solicitud.asesor && (
                <div className="bg-green-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="text-2xl mr-2">👨‍💼</span>
                    Asesor Asignado
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600 text-sm">Nombre:</span>
                      <p className="font-semibold">{solicitud.asesor.nombre}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Email:</span>
                      <p className="font-semibold">{solicitud.asesor.email}</p>
                    </div>
                    {solicitud.fecha_asignacion && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600 text-sm">Fecha de asignación:</span>
                        <p className="font-semibold">{formatearFecha(solicitud.fecha_asignacion)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información de la Localidad (si está asignada) */}
              {solicitud.localidad && (
                <div className="bg-purple-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="text-2xl mr-2">📍</span>
                    Localidad Asignada
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600 text-sm">Nombre:</span>
                      <p className="font-semibold">{solicitud.localidad.nombre}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Dirección:</span>
                      <p className="font-semibold">{solicitud.localidad.direccion}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Disponibilidad:</span>
                      <p className="font-semibold text-blue-600">{solicitud.localidad.disponibilidad?.toLocaleString()}L</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Encargado:</span>
                      <p className="font-semibold">{solicitud.localidad.encargado?.nombre || 'No asignado'}</p>
                    </div>
                    {solicitud.observaciones && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600 text-sm">Observaciones del asesor:</span>
                        <p className="font-semibold">{solicitud.observaciones}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información del Ticket (si existe) */}
              {solicitud.ticket && (
                <div className="bg-yellow-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="text-2xl mr-2">🎫</span>
                    Ticket de Entrega
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600 text-sm">Código:</span>
                      <p className="font-semibold text-lg font-mono bg-white px-3 py-1 rounded border">
                        {solicitud.ticket.codigo_ticket}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Estado:</span>
                      <p className="font-semibold capitalize">{solicitud.ticket.estado_entrega}</p>
                    </div>
                    {solicitud.ticket.fecha_llegada && (
                      <div>
                        <span className="text-gray-600 text-sm">Fecha de llegada:</span>
                        <p className="font-semibold">{formatearFecha(solicitud.ticket.fecha_llegada)}</p>
                      </div>
                    )}
                    {solicitud.ticket.cantidad_entregada && (
                      <div>
                        <span className="text-gray-600 text-sm">Cantidad entregada:</span>
                        <p className="font-semibold text-green-600">{solicitud.ticket.cantidad_entregada}L</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline de Estados */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-2">📈</span>
                  Progreso de la Solicitud
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Solicitud creada</span>
                    <span className="text-xs text-gray-400">
                      {formatearFecha(solicitud.fecha_solicitud)}
                    </span>
                  </div>
                  {['asignada', 'en_proceso', 'completada'].includes(solicitud.estado) && (
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Solicitud asignada</span>
                      {solicitud.fecha_asignacion && (
                        <span className="text-xs text-gray-400">
                          {formatearFecha(solicitud.fecha_asignacion)}
                        </span>
                      )}
                    </div>
                  )}
                  {['en_proceso', 'completada'].includes(solicitud.estado) && (
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">En proceso</span>
                    </div>
                  )}
                  {solicitud.estado === 'completada' && (
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Completada</span>
                    </div>
                  )}
                  {solicitud.estado === 'cancelada' && (
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Cancelada</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❓</div>
              <p className="text-gray-500">No se pudieron cargar los detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolicitudPreviewModal;