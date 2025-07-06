// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost/api';

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
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      window.location.href = '/'; // Redirect al login
    }
    
    // Log de errores para debug
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      url: error.config?.url
    });
    
    return Promise.reject(error);
  }
);

// API Functions
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/usuarios/login', { email, password });
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

export const solicitudAPI = {
  crear: async (solicitudData) => {
    const response = await api.post('/solicitudes', solicitudData);
    return response;
  },
    
  listar: async () => {
    const response = await api.get('/solicitudes');
    return response;
  },
    
  obtener: async (id) => {
    const response = await api.get(`/solicitudes/${id}`);
    return response;
  },
    
  cambiarEstado: async (id, accion) => {
    const response = await api.put(`/solicitudes/${id}/estado`, { accion });
    return response;
  },
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
  generar: async (reporteData) => {
    const response = await api.post('/reportes', reporteData);
    return response;
  },
    
  obtener: async (id) => {
    const response = await api.get(`/reportes/${id}`);
    return response;
  },
    
  porLocalidad: async (localidadId) => {
    const response = await api.get(`/reportes/localidad/${localidadId}`);
    return response;
  },
};

export default api;