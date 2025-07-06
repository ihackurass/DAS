// src/components/SolicitudForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { solicitudAPI, localidadAPI } from '../services/api';
import useResponsive from '../hooks/useResponsive';

const SolicitudForm = ({ onSuccess }) => {
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  
  const [formData, setFormData] = useState({
    tipo_solicitud: '',
    cantidad_litros: '',
    descripcion: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [localidadesDisponibles, setLocalidadesDisponibles] = useState([]);

  // Configuración por tipo (Factory Pattern logic)
  const tipoConfig = {
    urgente: {
      color: 'red',
      icon: '🚨',
      title: 'Solicitud Urgente',
      maxLitros: 1000,
      descripcion: 'Para emergencias médicas o situaciones críticas',
      tiempoLimite: '2 horas',
      prioridad: 'Alta',
      validaciones: ['Máximo 1000 litros', 'Requiere justificación']
    },
    normal: {
      color: 'blue',
      icon: '💧',
      title: 'Solicitud Normal',
      maxLitros: 5000,
      descripcion: 'Para uso doméstico regular',
      tiempoLimite: '24 horas',
      prioridad: 'Media',
      validaciones: ['Máximo 5000 litros', 'Procesamiento estándar']
    },
    comercial: {
      color: 'purple',
      icon: '🏢',
      title: 'Solicitud Comercial',
      maxLitros: 50000,
      descripcion: 'Para negocios y empresas',
      tiempoLimite: '3 días',
      prioridad: 'Baja',
      validaciones: ['Mínimo 1000 litros', 'Requiere datos comerciales']
    }
  };

  // Calcular preview cuando cambian los datos
  useEffect(() => {
    if (formData.tipo_solicitud && formData.cantidad_litros) {
      const config = tipoConfig[formData.tipo_solicitud];
      setPreviewData({
        ...config,
        cantidadSolicitada: parseInt(formData.cantidad_litros),
        fechaLimite: new Date(Date.now() + getTimeLimit(formData.tipo_solicitud)).toLocaleString()
      });
      
      // Buscar localidades disponibles
      buscarLocalidades();
    } else {
      setPreviewData(null);
    }
  }, [formData.tipo_solicitud, formData.cantidad_litros]);

  const getTimeLimit = (tipo) => {
    switch (tipo) {
      case 'urgente': return 2 * 60 * 60 * 1000; // 2 horas
      case 'normal': return 24 * 60 * 60 * 1000; // 24 horas
      case 'comercial': return 3 * 24 * 60 * 60 * 1000; // 3 días
      default: return 24 * 60 * 60 * 1000;
    }
  };

  const buscarLocalidades = async () => {
    if (!formData.cantidad_litros) return;
    
    try {
      const response = await localidadAPI.buscar(
        parseInt(formData.cantidad_litros),
        'disponibilidad' // Estrategia por defecto
      );
      setLocalidadesDisponibles(response.data.data.localidades || []);
    } catch (error) {
      console.error('Error buscando localidades:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.tipo_solicitud) {
      setError('Selecciona un tipo de solicitud');
      return false;
    }

    const cantidad = parseInt(formData.cantidad_litros);
    if (!cantidad || cantidad <= 0) {
      setError('Ingresa una cantidad válida');
      return false;
    }

    const config = tipoConfig[formData.tipo_solicitud];
    
    if (formData.tipo_solicitud === 'urgente' && cantidad > config.maxLitros) {
      setError(`Solicitud urgente no puede exceder ${config.maxLitros} litros`);
      return false;
    }

    if (formData.tipo_solicitud === 'normal' && cantidad > config.maxLitros) {
      setError(`Solicitud normal no puede exceder ${config.maxLitros} litros`);
      return false;
    }

    if (formData.tipo_solicitud === 'comercial' && cantidad < 1000) {
      setError('Solicitud comercial requiere mínimo 1000 litros');
      return false;
    }

    if (formData.tipo_solicitud === 'urgente' && !formData.descripcion.trim()) {
      setError('Solicitud urgente requiere justificación');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      const solicitudData = {
        usuario_id: user.id,
        tipo_solicitud: formData.tipo_solicitud,
        cantidad_litros: parseInt(formData.cantidad_litros),
        descripcion: formData.descripcion.trim()
      };

      const response = await solicitudAPI.crear(solicitudData);
      
      setSuccess('¡Solicitud creada exitosamente!');
      setFormData({ tipo_solicitud: '', cantidad_litros: '', descripcion: '' });
      setPreviewData(null);
      
      // Callback para actualizar la lista
      if (onSuccess) onSuccess();
      
      // Auto-hide success message
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Nueva Solicitud 💧</h2>
        <p className="text-blue-100">Crea una solicitud de agua personalizada</p>
      </div>

      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
        {/* Formulario */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Solicitud */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Solicitud
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(tipoConfig).map(([tipo, config]) => (
                  <label key={tipo} className="cursor-pointer">
                    <input
                      type="radio"
                      name="tipo_solicitud"
                      value={tipo}
                      checked={formData.tipo_solicitud === tipo}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-xl border-2 transition-all ${
                      formData.tipo_solicitud === tipo
                        ? `border-${config.color}-500 bg-${config.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="text-center">
                        <div className="text-2xl mb-2">{config.icon}</div>
                        <div className="font-medium text-sm capitalize">{tipo}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {config.prioridad} prioridad
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad de Agua (litros)
              </label>
              <input
                type="number"
                name="cantidad_litros"
                value={formData.cantidad_litros}
                onChange={handleChange}
                min="1"
                max={previewData?.maxLitros || 50000}
                placeholder="Ej: 1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {previewData && (
                <p className="text-xs text-gray-500 mt-1">
                  Límite: {previewData.maxLitros.toLocaleString()} litros
                </p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción {formData.tipo_solicitud === 'urgente' && '*'}
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="4"
                placeholder={
                  formData.tipo_solicitud === 'urgente' 
                    ? "Explica por qué necesitas esta solicitud urgente..."
                    : "Describe el uso que le darás al agua (opcional)..."
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.tipo_solicitud || !formData.cantidad_litros}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? '⏳ Creando solicitud...' : '🚀 Crear Solicitud'}
            </button>
          </form>
        </div>

        {/* Preview */}
        {previewData && (
          <div className="space-y-6">
            {/* Información del tipo */}
            <div className={`bg-gradient-to-r from-${previewData.color}-500 to-${previewData.color}-600 rounded-2xl p-6 text-white`}>
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">{previewData.icon}</span>
                <div>
                  <h3 className="text-xl font-bold">{previewData.title}</h3>
                  <p className="text-sm opacity-90">{previewData.descripcion}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs opacity-75">Tiempo límite</p>
                  <p className="font-semibold">{previewData.tiempoLimite}</p>
                </div>
                <div>
                  <p className="text-xs opacity-75">Prioridad</p>
                  <p className="font-semibold">{previewData.prioridad}</p>
                </div>
              </div>
            </div>

            {/* Detalles de la solicitud */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <h4 className="font-semibold text-gray-800 mb-4">📋 Resumen de Solicitud</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cantidad:</span>
                  <span className="font-medium">{previewData.cantidadSolicitada.toLocaleString()} L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium capitalize">{formData.tipo_solicitud}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha límite:</span>
                  <span className="font-medium text-sm">{previewData.fechaLimite}</span>
                </div>
              </div>
              
              {/* Validaciones */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2">📝 Validaciones:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {previewData.validaciones.map((validacion, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>{validacion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Localidades disponibles */}
            {localidadesDisponibles.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
                <h4 className="font-semibold text-gray-800 mb-4">📍 Localidades Disponibles</h4>
                <div className="space-y-2">
                  {localidadesDisponibles.slice(0, 3).map((localidad) => (
                    <div key={localidad.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{localidad.nombre}</p>
                        <p className="text-xs text-gray-500">{localidad.direccion}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          {localidad.disponibilidad.toLocaleString()}L
                        </p>
                        <p className="text-xs text-gray-500">disponible</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitudForm;