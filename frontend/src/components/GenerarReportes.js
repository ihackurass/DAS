// src/components/GenerarReportes.js
import React, { useState } from 'react';
import { reporteAPI } from '../services/api';

const GenerarReportes = () => {
  const [loading, setLoading] = useState(false);
  const [reporte, setReporte] = useState(null);
  const [error, setError] = useState('');

  const generarReporte = async () => {
    setLoading(true);
    setError('');
    setReporte(null);

    try {
      const response = await reporteAPI.resumenGeneral();
      setReporte(response.data.data);
      console.log('📊 Reporte generado:', response.data.data);
    } catch (err) {
      setError('Error al generar el reporte. Intenta nuevamente.');
      console.error('❌ Error generando reporte:', err);
    } finally {
      setLoading(false);
    }
  };

  const descargarReporte = () => {
    if (!reporte) return;

    const contenido = `
REPORTE GENERAL DEL SISTEMA GOTA A GOTA
=======================================
Fecha de generación: ${new Date().toLocaleString()}

RESUMEN DE SOLICITUDES
----------------------
Total solicitudes: ${reporte.total_solicitudes}
Pendientes: ${reporte.solicitudes_pendientes}
Completadas: ${reporte.solicitudes_completadas}
Canceladas: ${reporte.solicitudes_canceladas}

RESUMEN DE ENTREGAS
-------------------
Total entregas: ${reporte.total_entregas}
Litros entregados: ${reporte.total_litros_entregados}L
Promedio por entrega: ${reporte.promedio_litros}L

LOCALIDADES MÁS ACTIVAS
-----------------------
${reporte.top_localidades?.map((loc, i) => 
  `${i + 1}. ${loc.nombre} - ${loc.total_entregas} entregas`
).join('\n') || 'No hay datos'}

ESTADÍSTICAS GENERALES
----------------------
Eficiencia de entregas: ${reporte.eficiencia_entregas}%
Usuarios registrados: ${reporte.total_usuarios}
Localidades activas: ${reporte.total_localidades}
    `.trim();

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-gota-a-gota-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">📊 Generar Reportes</h1>
        <p className="text-purple-100">Resumen general del sistema en un solo clic</p>
      </div>

      {/* Generador */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200/50">
        <div className="text-center">
          <div className="text-6xl mb-4">📈</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Reporte General del Sistema</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Genera un resumen completo con todas las estadísticas importantes del sistema
          </p>

          <button
            onClick={generarReporte}
            disabled={loading}
            className="px-8 py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white rounded-xl font-bold text-lg transition-colors"
          >
            {loading ? '⏳ Generando...' : '📊 Generar Reporte'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 font-medium">❌ {error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reporte Generado */}
      {reporte && (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">📄 Reporte Generado</h3>
            <button
              onClick={descargarReporte}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              💾 Descargar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Solicitudes */}
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">📋</div>
              <h4 className="font-bold text-blue-800 mb-2">Solicitudes</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Total:</span> {reporte.total_solicitudes}</p>
                <p><span className="font-medium">Completadas:</span> {reporte.solicitudes_completadas}</p>
                <p><span className="font-medium">Pendientes:</span> {reporte.solicitudes_pendientes}</p>
              </div>
            </div>

            {/* Entregas */}
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">🚚</div>
              <h4 className="font-bold text-green-800 mb-2">Entregas</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Total:</span> {reporte.total_entregas}</p>
                <p><span className="font-medium">Litros:</span> {reporte.total_litros_entregados}L</p>
                <p><span className="font-medium">Promedio:</span> {reporte.promedio_litros}L</p>
              </div>
            </div>

            {/* Sistema */}
            <div className="bg-purple-50 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">⚙️</div>
              <h4 className="font-bold text-purple-800 mb-2">Sistema</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Usuarios:</span> {reporte.total_usuarios}</p>
                <p><span className="font-medium">Localidades:</span> {reporte.total_localidades}</p>
                <p><span className="font-medium">Eficiencia:</span> {reporte.eficiencia_entregas}%</p>
              </div>
            </div>
          </div>

          {/* Top Localidades */}
          {reporte.top_localidades && reporte.top_localidades.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-bold text-gray-800 mb-4">🏆 Top 5 Localidades Más Activas</h4>
              <div className="space-y-2">
                {reporte.top_localidades.map((localidad, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-400' : 'bg-blue-400'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-medium">{localidad.nombre}</span>
                    </div>
                    <span className="text-sm text-gray-600">{localidad.total_entregas} entregas</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información de generación */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Reporte generado el {new Date().toLocaleString()}
          </div>
        </div>
      )}

      {/* Información */}
      {!reporte && (
        <div className="bg-gray-50 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-4">ℹ️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">¿Qué incluye el reporte?</h3>
          <div className="text-sm text-gray-600 space-y-2 max-w-md mx-auto">
            <p>✅ Resumen de todas las solicitudes</p>
            <p>✅ Estadísticas de entregas completadas</p>
            <p>✅ Localidades más activas</p>
            <p>✅ Eficiencia general del sistema</p>
            <p>✅ Descarga en formato de texto</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerarReportes;