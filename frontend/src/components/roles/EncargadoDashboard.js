// src/components/roles/EncargadoDashboard.js
import React, { useState } from 'react';
import { ticketAPI } from '../../services/api';
import GenerarReportes from '../GenerarReportes';

const EncargadoDashboard = ({ activeTab }) => {
  const [codigo, setCodigo] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completando, setCompletando] = useState(false);

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
      setError('Ticket no encontrado. Verifica el código.');
      console.error('❌ Error buscando ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  const completarEntrega = async () => {
    if (!ticket) return;
    
    setCompletando(true);
    try {
      await ticketAPI.registrarEntrega(ticket.ticket.id, {
        cantidad_entregada: ticket.solicitud.cantidad_litros,
        estado_final: 'entregado',
        observaciones: 'Entrega completada por el encargado'
      });
      
      // Actualizar estado local
      setTicket({
        ...ticket,
        ticket: {
          ...ticket.ticket,
          estado: 'entregado',
          cantidad_entregada: ticket.solicitud.cantidad_litros
        }
      });
      
      console.log('✅ Entrega completada');
    } catch (error) {
      setError('Error al completar la entrega. Intenta nuevamente.');
      console.error('❌ Error completando entrega:', error);
    } finally {
      setCompletando(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'entregado': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente': return '⏳';
      case 'entregado': return '✅';
      default: return '🎫';
    }
  };

  // Si está en reportes, mostrar GenerarReportes
  if (activeTab === 'reportes') {
    return <GenerarReportes />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">¡Hola Encargado! 👨‍💼</h1>
        <p className="text-green-100">Busca tickets y completa entregas de manera simple</p>
      </div>

      {/* Buscador de Tickets */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200/50">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">🔍 Buscar Ticket</h2>
          <p className="text-gray-600">Ingresa el código del ticket para procesar la entrega</p>
        </div>

        <form onSubmit={buscarTicket} className="max-w-md mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ej: TKT-2025-001"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-lg"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !codigo.trim()}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-colors"
            >
              {loading ? '🔄' : '🔍'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
            <p className="text-red-600 font-medium">❌ {error}</p>
          </div>
        )}
      </div>

      {/* Resultado del Ticket */}
      {ticket && (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">🎫 Información del Ticket</h3>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Header del ticket */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Código del Ticket</p>
                  <p className="text-2xl font-bold font-mono text-blue-600">{ticket.ticket.codigo}</p>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getEstadoColor(ticket.ticket.estado)}`}>
                    {getEstadoIcon(ticket.ticket.estado)} {ticket.ticket.estado.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Información del cliente y solicitud */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="text-lg font-semibold text-gray-800">{ticket.cliente.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="text-lg font-semibold text-gray-800">{ticket.cliente.telefono}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Cantidad Solicitada</p>
                  <p className="text-lg font-semibold text-blue-600">{ticket.solicitud.cantidad_litros}L</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo de Solicitud</p>
                  <p className="text-lg font-semibold text-gray-800 capitalize">{ticket.solicitud.tipo_solicitud}</p>
                </div>
              </div>
            </div>

            {/* Información de la localidad */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Localidad de Entrega</p>
              <p className="font-semibold text-gray-800">{ticket.localidad.nombre}</p>
              <p className="text-sm text-gray-600">{ticket.localidad.direccion}</p>
            </div>

            {/* Descripción si existe */}
            {ticket.solicitud.descripcion && (
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Descripción</p>
                <p className="text-gray-800">{ticket.solicitud.descripcion}</p>
              </div>
            )}

            {/* Botón de acción */}
            <div className="text-center">
              {ticket.ticket.estado === 'pendiente' ? (
                <button
                  onClick={completarEntrega}
                  disabled={completando}
                  className="px-8 py-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-xl font-bold text-lg transition-colors"
                >
                  {completando ? '🔄 Procesando...' : '✅ Completar Entrega'}
                </button>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-800 font-semibold">
                    ✅ Entrega ya completada
                  </p>
                  {ticket.ticket.cantidad_entregada && (
                    <p className="text-sm text-green-600 mt-1">
                      Cantidad entregada: {ticket.ticket.cantidad_entregada}L
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      {!ticket && (
        <div className="bg-gray-50 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">¿Cómo funciona?</h3>
          <div className="text-sm text-gray-600 space-y-2 max-w-md mx-auto">
            <p>1. El cliente llega con su código de ticket</p>
            <p>2. Ingresa el código en el buscador</p>
            <p>3. Verifica la información del cliente</p>
            <p>4. Haz clic en "Completar Entrega"</p>
            <p>5. ¡Listo! La entrega queda registrada</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncargadoDashboard;