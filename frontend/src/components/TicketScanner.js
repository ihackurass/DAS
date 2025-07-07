// src/components/TicketScanner.js
import React, { useState } from 'react';
import { ticketAPI } from '../services/api';

const TicketScanner = ({ onTicketFound }) => {
  const [codigo, setCodigo] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const buscarTicket = async (e) => {
    e.preventDefault();
    if (!codigo.trim()) return;

    setLoading(true);
    setError('');
    setTicket(null);

    try {
      const response = await ticketAPI.buscarPorCodigo(codigo.trim());
      setTicket(response.data.data);
      console.log('🎫 Ticket encontrado:', response.data.data);
    } catch (err) {
      setError('Ticket no encontrado. Verifica el código e intenta nuevamente.');
      console.error('❌ Error buscando ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  const registrarLlegada = async () => {
    if (!ticket) return;

    try {
      await ticketAPI.registrarLlegada(ticket.ticket.id);
      // Recargar ticket para ver estado actualizado
      buscarTicket({ preventDefault: () => {} });
      if (onTicketFound) onTicketFound();
      console.log('✅ Llegada registrada');
    } catch (err) {
      setError('Error al registrar llegada');
      console.error('❌ Error registrando llegada:', err);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'en_proceso': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'entregado': return 'bg-green-100 text-green-800 border-green-300';
      case 'parcial': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente': return '⏳';
      case 'en_proceso': return '🚛';
      case 'entregado': return '✅';
      case 'parcial': return '📦';
      case 'cancelado': return '❌';
      default: return '🎫';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">🔍 Buscar Ticket</h1>
        <p className="text-blue-100">Busca el ticket del cliente por código</p>
      </div>

      {/* Formulario de búsqueda */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200/50">
        <form onSubmit={buscarTicket} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-lg font-medium mb-3">
              Código del Ticket
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="Ej: TKT-2025-001"
                className="flex-1 px-6 py-4 text-xl font-mono border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !codigo.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold transition-colors text-lg"
              >
                {loading ? '🔄 Buscando...' : '🔍 Buscar'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Ingresa el código completo del ticket (ejemplo: TKT-2025-001)
            </p>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-500 text-xl">❌</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Resultado del ticket */}
      {ticket && (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              🎫 Ticket Encontrado
            </h2>
            <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getEstadoColor(ticket.ticket.estado)}`}>
              <span className="mr-1">{getEstadoIcon(ticket.ticket.estado)}</span>
              {ticket.ticket.estado.toUpperCase()}
            </div>
          </div>

          {/* Información del ticket */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Datos del cliente */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="mr-2">👤</span>
                Información del Cliente
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Nombre:</p>
                  <p className="font-semibold text-lg">{ticket.cliente.nombre}</p>
                </div>
                {ticket.cliente.telefono && (
                  <div>
                    <p className="text-sm text-gray-600">Teléfono:</p>
                    <p className="font-medium">{ticket.cliente.telefono}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Datos de la solicitud */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="mr-2">💧</span>
                Información de la Solicitud
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Cantidad solicitada:</p>
                  <p className="font-semibold text-2xl text-blue-600">
                    {ticket.solicitud.cantidad_litros} litros
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo de solicitud:</p>
                  <p className="font-medium capitalize">{ticket.solicitud.tipo_solicitud}</p>
                </div>
                {ticket.solicitud.descripcion && (
                  <div>
                    <p className="text-sm text-gray-600">Descripción:</p>
                    <p className="text-sm text-gray-800">{ticket.solicitud.descripcion}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información adicional del ticket */}
          {(ticket.ticket.fecha_llegada || ticket.ticket.cantidad_entregada || ticket.ticket.observaciones) && (
            <div className="mt-6 bg-blue-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">📋</span>
                Detalles del Ticket
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {ticket.ticket.fecha_llegada && (
                  <div>
                    <p className="text-gray-600">Llegada registrada:</p>
                    <p className="font-medium">
                      {new Date(ticket.ticket.fecha_llegada).toLocaleString()}
                    </p>
                  </div>
                )}
                {ticket.ticket.cantidad_entregada && (
                  <div>
                    <p className="text-gray-600">Cantidad entregada:</p>
                    <p className="font-medium">{ticket.ticket.cantidad_entregada} litros</p>
                  </div>
                )}
                {ticket.ticket.observaciones && (
                  <div className="md:col-span-3">
                    <p className="text-gray-600">Observaciones:</p>
                    <p className="text-gray-800 italic">"{ticket.ticket.observaciones}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="mt-8 flex gap-4">
            {ticket.ticket.estado === 'pendiente' && (
              <button
                onClick={registrarLlegada}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
              >
                <span>🚪</span>
                <span>Registrar Llegada</span>
              </button>
            )}

            {ticket.ticket.estado === 'en_proceso' && (
              <div className="bg-blue-100 text-blue-800 px-6 py-3 rounded-xl font-medium flex items-center space-x-2">
                <span>🚛</span>
                <span>Cliente en proceso de atención</span>
              </div>
            )}

            {ticket.ticket.estado === 'entregado' && (
              <div className="bg-green-100 text-green-800 px-6 py-3 rounded-xl font-medium flex items-center space-x-2">
                <span>✅</span>
                <span>Entrega completada</span>
              </div>
            )}

            <button
              onClick={() => {
                setCodigo('');
                setTicket(null);
                setError('');
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Buscar Otro Ticket
            </button>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          Instrucciones
        </h3>
        <ul className="text-amber-700 space-y-2 text-sm">
          <li>• El cliente debe proporcionarte el código de su ticket</li>
          <li>• Busca el ticket usando el código completo (ej: TKT-2025-001)</li>
          <li>• Verifica los datos del cliente antes de proceder</li>
          <li>• Registra la llegada cuando el cliente esté presente</li>
          <li>• Procede con la entrega según la cantidad solicitada</li>
        </ul>
      </div>
    </div>
  );
};

export default TicketScanner;