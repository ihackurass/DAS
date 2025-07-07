// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos timeout
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    // DEBUG: Log del request completo
    console.log('🚀 REQUEST CONFIG:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    });

    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log('✅ RESPONSE SUCCESS:', {
      status: response.status,
      data: response.data,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    console.error('❌ RESPONSE ERROR:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      message: error.message
    });

    if (error.response?.status === 401) {
      // Token inválido o expirado
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      window.location.href = '/'; // Redirect al login
    }
    
    return Promise.reject(error);
  }
);

// API Functions
export const authAPI = {
  login: async (email, password) => {
    
    const loginData = { email, password };
    
    const response = await api.post('/usuarios/login', loginData);
    return response;
  },
  
  registro: async (userData) => {
    const response = await api.post('/usuarios/registro', userData);
    return response;
  },
  
  perfil: async (id) => {
    const response = await api.get(`/usuarios/perfil/${id}`);
    return response;
  }
};

export const ticketAPI = {
  buscarPorCodigo: (codigo) => api.get(`/tickets/${codigo}`),
  registrarLlegada: (ticketId) => api.put(`/tickets/${ticketId}/llegada`),
  registrarEntrega: (ticketId, data) => api.put(`/tickets/${ticketId}/entrega`, data),
  obtenerPorLocalidad: (localidadId) => api.get(`/tickets/localidad/${localidadId}`),
  obtenerPorEncargado: (encargadoId, fecha = null) => {
    const params = fecha ? `?fecha=${fecha}` : '';
    return api.get(`/tickets/encargado/${encargadoId}${params}`);
  }
};

// ACTUALIZAR solicitudAPI para incluir ticket
export const solicitudAPI = {
  crear: (solicitud) => api.post('/solicitudes', solicitud),
  listar: () => api.get('/solicitudes'),
  obtener: (id) => api.get(`/solicitudes/${id}`),
  obtenerAsignacion: (id) => api.get(`/solicitudes/${id}/asignacion`),
  obtenerTicket: (id) => api.get(`/solicitudes/${id}/ticket`), // ← NUEVA FUNCIÓN
  actualizar: (id, data) => api.put(`/solicitudes/${id}`, data),
  asignar: (id, asignacionData) => api.put(`/solicitudes/${id}/asignar`, asignacionData),
  cambiarEstado: (id, nuevoEstado) => api.put(`/solicitudes/${id}/estado`, { estado: nuevoEstado })
};

export const estadisticasAPI = {
  dashboard: () => api.get('/estadisticas/dashboard'),
  encargado: (encargadoId, fecha = null) => {
    const params = fecha ? `?fecha=${fecha}` : '';
    return api.get(`/estadisticas/encargado/${encargadoId}${params}`);
  },
  asesor: (asesorId) => api.get(`/estadisticas/asesor/${asesorId}`),
  cliente: (clienteId) => api.get(`/estadisticas/cliente/${clienteId}`)
};

export const localidadAPI = {
  listar: async () => {
    const response = await api.get('/localidades');
    return response;
  },
    
  buscar: async (cantidad, estrategia) => {
    const response = await api.post('/localidades/buscar', { 
      cantidad_litros: cantidad, 
      estrategia 
    });
    return response;
  },
};

export const reporteAPI = {
  generar: (reporteData) => api.post('/reportes', reporteData),
  obtener: (id) => api.get(`/reportes/${id}`),
  listarPorLocalidad: (localidadId) => api.get(`/reportes/localidad/${localidadId}`),
  eliminar: (id) => api.delete(`/reportes/${id}`),
  historialComandos: () => api.get('/reportes/comandos/historial'),
  deshacerComando: () => api.post('/reportes/comandos/deshacer'),
  // ← NUEVAS FUNCIONES
  resumenDiario: (fecha = null) => {
    const params = fecha ? `?fecha=${fecha}` : '';
    return api.get(`/reportes/resumen/diario${params}`);
  },
  resumenSemanal: () => api.get('/reportes/resumen/semanal'),
  resumenMensual: () => api.get('/reportes/resumen/mensual')
};

export default api;