import axios from "axios";
import { toast } from "react-hot-toast";
import { captureException } from "./errorTracking";

const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:4000/api";

const api = axios.create({
  baseURL,
  timeout: 30000, // 30 segundos timeout
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor para manejar errores de la arquitectura hexagonal
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extraer mensaje de error
    const errorMessage = error.response?.data?.message || error.response?.data?.error;
    const statusCode = error.response?.status;

    // Manejar errores de autenticación
    if (statusCode === 401) {
      console.warn('⚠️ Sesión expirada o no autorizado');

      // Solo redirigir si no estamos ya en login o en página pública
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.match(/^\/[^\/]+$/)) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', {
          duration: 5000,
        });
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    // Manejar errores 404
    else if (statusCode === 404) {
      console.error('🔴 Recurso no encontrado:', error.config?.url);
      // No mostrar toast para 404, dejar que el componente lo maneje
    }

    // Manejar errores 500
    else if (statusCode === 500) {
      console.error('🔴 Error interno del servidor:', errorMessage);
      toast.error('Error del servidor. Nuestro equipo ha sido notificado.', {
        duration: 5000,
      });

      // Log a Sentry
      captureException(error, {
        context: 'API 500 Error',
        url: error.config?.url,
        method: error.config?.method,
      });
    }

    // Manejar errores de red (offline, timeout)
    else if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.error('🔴 Error de red:', error.message);
      toast.error('No se pudo conectar al servidor. Verifica tu conexión a internet.', {
        duration: 6000,
      });
    }

    // Otros errores (400, 403, etc.)
    else if (errorMessage) {
      console.error('🔴 Error del servidor:', errorMessage);
      // Dejar que el componente maneje el mensaje específico
    }

    return Promise.reject(error);
  }
);

export default api;
