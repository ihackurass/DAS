// src/components/ReportesRapidos.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reporteAPI, estadisticasAPI } from '../services/api';

const ReportesRapidos = ({ onClose }) => {
  const { user } = useAuth();
  const [tipoReporte, setTipoReporte] = useState('diario');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generarReporte = async () => {
    setLoading(true);
    setError('');
    
    try {
      let response;
      
      switch (tipoReporte) {
        case 'diario':
          response = await estadisticasAPI.encargado(user.id, fecha);
          break;
        case 'semanal':
          response = await reporteAPI.resumenSemanal();
          break;
        case 'mensual':
          response = await reporteAPI.resumenMensual();
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }
      
      setReporte(response.data.data);
    } catch (err) {
      setError('Error al generar el reporte');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportarReporte = () => {
    if (!reporte) return;
    
    const contenido = generarContenidoReporte();
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${tipoReporte}_${fecha}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generarContenidoReporte = () => {
    if (!reporte) return '';
    
    let contenido = `REPORTE ${tipoReporte.toUpperCase()}\n`;
    contenido += `Fecha: ${fecha}\n`;
    contenido += `Encargado: ${user.nombre}\n`;
    contenido += `Generado: ${new Date().toLocaleString()}\n`;
    contenido += '\n=================================\n\n';
    
    if (reporte.tickets_del_dia) {
      contenido += 'TICKETS DEL DÍA:\n';
      reporte.tickets_del_dia.forEach(ticket => {
        contenido += `- ${ticket.estado_entrega}: ${ticket.cantidad} tickets\n`;
      });
      contenido += '\n';
    }
    
    if (reporte.localidades) {
      contenido += 'LOCALIDADES GESTIONADAS:\n';
      reporte.localidades.forEach(loc => {
        contenido += `- ${loc.nombre}: ${loc.disponibilidad}L disponibles\n`;
      });
      contenido += '\n';
    }
    
    if (reporte.resumen_semana) {
      contenido += 'RESUMEN SEMANAL:\n';
      reporte.resumen_semana.forEach(dia => {
        contenido += `- ${dia.fecha}: ${dia.total_tickets} tickets, ${dia.entregados} entregados\n`;
      });
    }
    
    return contenido;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📈 Generar Reporte Rápido
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Configuración del reporte */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">⚙️ Configuración</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo de reporte */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Tipo de Reporte
              </label>
              <select
                value={tipoReporte}
                onChange={(e) => setTipoReporte(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="diario">📅 Reporte Diario</option>
                <option value="semanal">📊 Reporte Semanal</option>
                <option value="mensual">📈 Reporte Mensual</option>
              </select>
            </div>

            {/* Fecha (solo para reporte diario) */}
            {tipoReporte === 'diario' && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={generarReporte}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <span>📊</span>
                  <span>Generar Reporte</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">❌</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Resultados del reporte */}
        {reporte && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">📋 Resultado del Reporte</h3>
              <button
                onClick={exportarReporte}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <span>💾</span>
                <span>Exportar</span>
              </button>
            </div>

            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {reporte.tickets_del_dia?.reduce((sum, item) => sum + parseInt(item.cantidad), 0) || 0}
                </div>
                <div className="text-sm text-gray-600">Total Tickets</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {reporte.tickets_del_dia?.find(t => t.estado_entrega === 'entregado')?.cantidad || 0}
                </div>
                <div className="text-sm text-gray-600">Entregados</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {reporte.tickets_del_dia?.find(t => t.estado_entrega === 'pendiente')?.cantidad || 0}
                </div>
                <div className="text-sm text-gray-600">Pendientes</div>
              </div>
            </div>

            {/* Detalles por estado */}
            {reporte.tickets_del_dia && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3">📊 Tickets por Estado</h4>
                <div className="space-y-2">
                  {reporte.tickets_del_dia.map((item) => (
                    <div key={item.estado_entrega} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="capitalize font-medium">{item.estado_entrega}</span>
                      <span className="font-bold">{item.cantidad} tickets</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Localidades gestionadas */}
            {reporte.localidades && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3">🏢 Localidades Gestionadas</h4>
                <div className="space-y-2">
                  {reporte.localidades.map((localidad) => (
                    <div key={localidad.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{localidad.nombre}</div>
                        <div className="text-sm text-gray-500">{localidad.direccion}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{localidad.disponibilidad}L</div>
                        <div className="text-sm text-gray-500">disponibles</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumen semanal */}
            {reporte.resumen_semana && (
              <div>
                <h4 className="font-semibold mb-3">📅 Resumen de la Semana</h4>
                <div className="space-y-2">
                  {reporte.resumen_semana.map((dia) => (
                    <div key={dia.fecha} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{new Date(dia.fecha).toLocaleDateString()}</span>
                      <div className="text-right">
                        <div className="font-bold">{dia.total_tickets} tickets</div>
                        <div className="text-sm text-gray-500">{dia.entregados} entregados</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botón de cerrar */}
        <div className="mt-6 text-center">
          <button 
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-8 rounded-xl font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportesRapidos;