// src/components/RegistrarEntrega.js
import React, { useState } from 'react';
import { ticketAPI } from '../services/api';

const RegistrarEntrega = ({ ticket, onComplete, onCancel }) => {
  const [formData, setFormData] = useState({
    cantidad_entregada: ticket.solicitud?.cantidad_litros || 0,
    estado_final: 'entregado',
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cantidad_entregada' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (formData.cantidad_entregada < 0) {
      setError('La cantidad no puede ser negativa');
      setLoading(false);
      return;
    }

    if (formData.estado_final === 'entregado' && formData.cantidad_entregada === 0) {
      setError('Para marcar como entregado debe indicar una cantidad mayor a 0');
      setLoading(false);
      return;
    }

    if (formData.estado_final === 'cancelado' && !formData.observaciones.trim()) {
      setError('Para cancelar debe proporcionar una razón en las observaciones');
      setLoading(false);
      return;
    }

    try {
      await ticketAPI.registrarEntrega(ticket.ticket.id, formData);
      console.log('✅ Entrega registrada exitosamente');
      onComplete();
    } catch (err) {
      setError('Error al registrar la entrega. Intenta nuevamente.');
      console.error('❌ Error registrando entrega:', err);
    } finally {
      setLoading(false);
    }
  };

  const cantidadSolicitada = ticket.solicitud?.cantidad_litros || 0;
  const esParcial = formData.cantidad_entregada < cantidadSolicitada && formData.cantidad_entregada > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📦 Registrar Entrega
          </h2>
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Información del ticket */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">🎫 Información del Ticket</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Código:</span>
              <p className="font-mono font-bold text-lg">{ticket.ticket.codigo}</p>
            </div>
            <div>
              <span className="text-gray-600">Cliente:</span>
              <p className="font-semibold">{ticket.cliente.nombre}</p>
            </div>
            <div>
              <span className="text-gray-600">Cantidad solicitada:</span>
              <p className="font-semibold text-blue-600">{cantidadSolicitada} litros</p>
            </div>
            <div>
              <span className="text-gray-600">Tipo:</span>
              <p className="font-semibold capitalize">{ticket.solicitud.tipo_solicitud}</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">❌</span>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Cantidad entregada */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Cantidad Entregada (litros)
            </label>
            <div className="relative">
              <input
                type="number"
                name="cantidad_entregada"
                value={formData.cantidad_entregada}
                onChange={handleChange}
                min="0"
                max={cantidadSolicitada}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                disabled={loading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                L
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>Mínimo: 0L</span>
              <span>Máximo: {cantidadSolicitada}L</span>
            </div>
            
            {/* Indicador visual de cantidad */}
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progreso</span>
                <span>{Math.round((formData.cantidad_entregada / cantidadSolicitada) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    formData.cantidad_entregada === cantidadSolicitada ? 'bg-green-500' :
                    formData.cantidad_entregada > 0 ? 'bg-orange-500' :
                    'bg-gray-400'
                  }`}
                  style={{ width: `${Math.min((formData.cantidad_entregada / cantidadSolicitada) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Estado final */}
          <div>
            <label className="block text-gray-700 font-medium mb-3">
              Estado de la Entrega
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                formData.estado_final === 'entregado' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="estado_final"
                  value="entregado"
                  checked={formData.estado_final === 'entregado'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-2xl mb-1">✅</div>
                  <div className="font-medium">Entregado</div>
                  <div className="text-xs text-gray-600">Completamente</div>
                </div>
              </label>

              <label className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                formData.estado_final === 'parcial' ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="estado_final"
                  value="parcial"
                  checked={formData.estado_final === 'parcial'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-2xl mb-1">📦</div>
                  <div className="font-medium">Parcial</div>
                  <div className="text-xs text-gray-600">Entrega parcial</div>
                </div>
              </label>

              <label className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                formData.estado_final === 'cancelado' ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="estado_final"
                  value="cancelado"
                  checked={formData.estado_final === 'cancelado'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-2xl mb-1">❌</div>
                  <div className="font-medium">Cancelado</div>
                  <div className="text-xs text-gray-600">No entregado</div>
                </div>
              </label>
            </div>

            {/* Auto-selección de estado según cantidad */}
            {esParcial && formData.estado_final === 'entregado' && (
              <div className="mt-3 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                <p className="text-orange-800 text-sm">
                  💡 La cantidad es menor a la solicitada. ¿Deseas marcar como "Parcial"?
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, estado_final: 'parcial' }))}
                    className="ml-2 underline hover:no-underline"
                  >
                    Marcar como Parcial
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Observaciones
              {formData.estado_final === 'cancelado' && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors resize-none"
              placeholder={
                formData.estado_final === 'cancelado' ? 
                'Explica por qué se cancela la entrega...' :
                formData.estado_final === 'parcial' ?
                'Explica por qué es entrega parcial...' :
                'Observaciones adicionales (opcional)...'
              }
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.estado_final === 'cancelado' ? 
                'Requerido: Explica el motivo de la cancelación' :
                'Opcional: Cualquier observación relevante sobre la entrega'
              }
            </p>
          </div>

          {/* Resumen */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-2">📋 Resumen de la Entrega</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Cantidad solicitada:</span>
                <span className="font-medium">{cantidadSolicitada}L</span>
              </div>
              <div className="flex justify-between">
                <span>Cantidad a entregar:</span>
                <span className="font-medium">{formData.cantidad_entregada}L</span>
              </div>
              <div className="flex justify-between">
                <span>Estado final:</span>
                <span className={`font-medium capitalize ${
                  formData.estado_final === 'entregado' ? 'text-green-600' :
                  formData.estado_final === 'parcial' ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {formData.estado_final}
                </span>
              </div>
              {formData.cantidad_entregada < cantidadSolicitada && formData.estado_final !== 'cancelado' && (
                <div className="flex justify-between text-orange-600">
                  <span>Faltante:</span>
                  <span className="font-medium">{cantidadSolicitada - formData.cantidad_entregada}L</span>
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-colors ${
                formData.estado_final === 'entregado' ? 'bg-green-500 hover:bg-green-600' :
                formData.estado_final === 'parcial' ? 'bg-orange-500 hover:bg-orange-600' :
                'bg-red-500 hover:bg-red-600'
              } text-white disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              {loading ? (
                '🔄 Registrando...'
              ) : (
                `${
                  formData.estado_final === 'entregado' ? '✅ Completar Entrega' :
                  formData.estado_final === 'parcial' ? '📦 Registrar Parcial' :
                  '❌ Cancelar Entrega'
                }`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrarEntrega;