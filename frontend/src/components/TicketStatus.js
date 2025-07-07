// frontend/src/components/TicketStatus.js
import React, { useState, useEffect } from 'react';
import { solicitudAPI } from '../services/api';

const TicketStatus = ({ solicitudId, compact = false }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarTicket = async () => {
      try {
        const response = await solicitudAPI.obtenerAsignacion(solicitudId);
        if (response.data.data.ticket) {
          setTicket(response.data.data.ticket);
        }
      } catch (err) {
        setError('Error al cargar ticket');
        console.error('Error cargando ticket:', err);
      } finally {
        setLoading(false);
      }
    };

    if (solicitudId) {
      cargarTicket();
      
      // ← OPCIONAL: Auto-refresh cada 30 segundos para estado en tiempo real
      const interval = setInterval(cargarTicket, 30000);
      return () => clearInterval(interval);
    }
  }, [solicitudId]);

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'en_proceso': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'entregado': return 'bg-green-100 text-green-800 border-green-300';
      case 'parcial': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'pendiente': return '⏳';
      case 'en_proceso': return '🚛';
      case 'entregado': return '✅';
      case 'parcial': return '📦';
      case 'cancelado': return '❌';
      default: return '🎫';
    }
  };

  const getProgressPercentage = (estado) => {
    switch (estado) {
      case 'pendiente': return 25;
      case 'en_proceso': return 75;
      case 'entregado': return 100;
      case 'parcial': return 80;
      case 'cancelado': return 100;
      default: return 0;
    }
  };

  const getNextStep = (estado) => {
    switch (estado) {
      case 'pendiente': return 'Dirígete a la localidad asignada';
      case 'en_proceso': return 'Estás siendo atendido';
      case 'entregado': return '¡Proceso completado!';
      case 'parcial': return 'Entrega parcial completada';
      case 'cancelado': return 'Contacta al asesor';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className={`${compact ? 'p-2' : 'p-4'} bg-gray-50 rounded-lg`}>
        <div className="animate-pulse flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return null; // No mostrar nada si no hay ticket
  }

  // Versión compacta para usar en listas
  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-lg">{getStatusIcon(ticket.estado)}</span>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.estado)}`}>
              {ticket.estado}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              {ticket.codigo}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Versión completa para usar en modales/páginas
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getStatusIcon(ticket.estado)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Estado del Ticket</h3>
            <p className="text-sm text-gray-500">Código: {ticket.codigo}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ticket.estado)}`}>
          {ticket.estado.toUpperCase()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progreso</span>
          <span>{getProgressPercentage(ticket.estado)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              ticket.estado === 'entregado' ? 'bg-green-500' :
              ticket.estado === 'cancelado' ? 'bg-red-500' :
              ticket.estado === 'parcial' ? 'bg-orange-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${getProgressPercentage(ticket.estado)}%` }}
          ></div>
        </div>
      </div>

      {/* Estado y siguiente paso */}
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Siguiente paso:</p>
          <p className="font-medium text-gray-800">{getNextStep(ticket.estado)}</p>
        </div>

        {/* Información adicional según el estado */}
        {ticket.fecha_llegada && (
          <div>
            <p className="text-sm text-gray-600">Llegada registrada:</p>
            <p className="text-sm font-medium text-gray-800">
              {new Date(ticket.fecha_llegada).toLocaleString()}
            </p>
          </div>
        )}

        {ticket.cantidad_entregada && (
          <div>
            <p className="text-sm text-gray-600">Cantidad entregada:</p>
            <p className="text-sm font-medium text-gray-800">
              {ticket.cantidad_entregada} litros
            </p>
          </div>
        )}

        {ticket.observaciones && (
          <div>
            <p className="text-sm text-gray-600">Observaciones:</p>
            <p className="text-sm text-gray-800 italic">
              "{ticket.observaciones}"
            </p>
          </div>
        )}
      </div>

      {/* Timeline visual para estados */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          {['pendiente', 'en_proceso', 'entregado'].map((estado, index) => {
            const isActive = ticket.estado === estado;
            const isCompleted = getProgressPercentage(ticket.estado) > getProgressPercentage(estado);
            const isCanceled = ticket.estado === 'cancelado';
            
            return (
              <div key={estado} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isActive ? 'bg-blue-500 text-white' :
                  isCompleted ? 'bg-green-500 text-white' :
                  isCanceled ? 'bg-red-500 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {isCompleted || isActive ? '✓' : index + 1}
                </div>
                {index < 2 && (
                  <div className={`w-16 h-1 mx-2 ${
                    isCompleted ? 'bg-green-500' :
                    isCanceled ? 'bg-red-500' :
                    'bg-gray-300'
                  }`}></div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Pendiente</span>
          <span>En Proceso</span>
          <span>Entregado</span>
        </div>
      </div>
    </div>
  );
};

export default TicketStatus;