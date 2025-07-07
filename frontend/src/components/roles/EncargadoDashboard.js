// src/components/roles/EncargadoDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ticketAPI, localidadAPI } from '../../services/api';
import TicketScanner from '../TicketScanner';
import RegistrarEntrega from '../RegistrarEntrega';

const EncargadoDashboard = ({ activeTab }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    pendiente: 0,
    en_proceso: 0,
    entregado: 0,
    cancelado: 0,
    parcial: 0
  });

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'tickets') {
      cargarDatos();
    }
  }, [activeTab]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar tickets del encargado
      const ticketsResponse = await ticketAPI.obtenerPorEncargado(user.id);
      const ticketsData = ticketsResponse.data.data;
      
      setTickets(ticketsData.tickets || []);
      setEstadisticas(ticketsData.estadisticas || {});
      
      // Cargar localidades para filtrar
      const localidadesResponse = await localidadAPI.listar();
      setLocalidades(localidadesResponse.data.data || []);
      
    } catch (error) {
      console.error('Error cargando datos del encargado:', error);
    } finally {
      setLoading(false);
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

  const handleRegistrarLlegada = async (ticketId) => {
    try {
      await ticketAPI.registrarLlegada(ticketId);
      cargarDatos(); // Recargar datos
      console.log('✅ Llegada registrada');
    } catch (error) {
      console.error('❌ Error registrando llegada:', error);
    }
  };

  const handleAbrirRegistroEntrega = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleEntregaCompletada = () => {
    setSelectedTicket(null);
    cargarDatos(); // Recargar datos
  };

  if (activeTab === 'buscar') {
    return <TicketScanner onTicketFound={cargarDatos} />;
  }

  if (activeTab === 'registrar' && selectedTicket) {
    return (
      <RegistrarEntrega 
        ticket={selectedTicket}
        onComplete={handleEntregaCompletada}
        onCancel={() => setSelectedTicket(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">¡Hola Encargado! 👨‍💼</h1>
        <p className="text-green-100">Gestiona las entregas de agua en tu localidad</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="text-center">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-2xl font-bold text-yellow-600">{estadisticas.pendiente || 0}</p>
            <p className="text-sm text-gray-500">Pendientes</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="text-center">
            <div className="text-2xl mb-2">🚛</div>
            <p className="text-2xl font-bold text-blue-600">{estadisticas.en_proceso || 0}</p>
            <p className="text-sm text-gray-500">En Proceso</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="text-center">
            <div className="text-2xl mb-2">✅</div>
            <p className="text-2xl font-bold text-green-600">{estadisticas.entregado || 0}</p>
            <p className="text-sm text-gray-500">Entregados</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="text-center">
            <div className="text-2xl mb-2">📦</div>
            <p className="text-2xl font-bold text-orange-600">{estadisticas.parcial || 0}</p>
            <p className="text-sm text-gray-500">Parciales</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="text-center">
            <div className="text-2xl mb-2">❌</div>
            <p className="text-2xl font-bold text-red-600">{estadisticas.cancelado || 0}</p>
            <p className="text-sm text-gray-500">Cancelados</p>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">🔍</span>
            Buscar Ticket
          </h3>
          <p className="text-gray-600 mb-4">Busca un ticket por código cuando llegue un cliente</p>
          <button 
            onClick={() => window.location.hash = '#buscar'}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
          >
            Buscar por Código
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">📊</span>
            Reporte del Día
          </h3>
          <p className="text-gray-600 mb-4">Ver resumen de entregas realizadas hoy</p>
          <button 
            onClick={() => window.alert('Función de reportes próximamente')}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
          >
            Ver Reporte
          </button>
        </div>
      </div>

      {/* Lista de Tickets */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Tickets de Hoy</h3>
          <button 
            onClick={cargarDatos}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🔄 Actualizar
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tickets...</p>
          </div>
        ) : tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getEstadoIcon(ticket.estado)}</span>
                    <div>
                      <p className="font-mono font-semibold text-lg">{ticket.codigo}</p>
                      <p className="text-sm text-gray-500">{ticket.cliente?.nombre}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(ticket.estado)}`}>
                      {ticket.estado}
                    </span>
                  </div>
                </div>

                {/* Información del ticket */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500">Cantidad</p>
                    <p className="font-medium">{ticket.solicitud?.cantidad_litros}L</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tipo</p>
                    <p className="font-medium capitalize">{ticket.solicitud?.tipo_solicitud}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Localidad</p>
                    <p className="font-medium">{ticket.localidad?.nombre}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Llegada</p>
                    <p className="font-medium">
                      {ticket.fecha_llegada ? 
                        new Date(ticket.fecha_llegada).toLocaleTimeString() : 
                        'No registrada'
                      }
                    </p>
                  </div>
                </div>

                {/* Acciones según el estado */}
                <div className="flex gap-2">
                  {ticket.estado === 'pendiente' && (
                    <button
                      onClick={() => handleRegistrarLlegada(ticket.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <span>🚪</span>
                      <span>Registrar Llegada</span>
                    </button>
                  )}
                  
                  {ticket.estado === 'en_proceso' && (
                    <button
                      onClick={() => handleAbrirRegistroEntrega(ticket)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <span>📦</span>
                      <span>Registrar Entrega</span>
                    </button>
                  )}

                  {ticket.estado === 'entregado' && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <span>✅</span>
                      <span>Entregado: {ticket.cantidad_entregada}L</span>
                    </div>
                  )}

                  {ticket.estado === 'cancelado' && (
                    <div className="flex items-center space-x-2 text-sm text-red-600">
                      <span>❌</span>
                      <span>Cancelado</span>
                    </div>
                  )}
                </div>

                {/* Observaciones si existen */}
                {ticket.observaciones && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Observaciones:</span> {ticket.observaciones}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">🎫</span>
            <p className="text-gray-500 mb-4">No hay tickets para mostrar</p>
            <button 
              onClick={cargarDatos}
              className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
            >
              Actualizar lista
            </button>
          </div>
        )}
      </div>

      {/* Modal de registro de entrega */}
      {selectedTicket && (
        <RegistrarEntrega 
          ticket={selectedTicket}
          onComplete={handleEntregaCompletada}
          onCancel={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
};

export default EncargadoDashboard;