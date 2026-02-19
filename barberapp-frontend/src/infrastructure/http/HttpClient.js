import axios from 'axios';
import { NetworkError, InfrastructureError } from '../shared/errors';

/**
 * HttpClient - Wrapper de Axios con manejo de errores
 * 
 * Proporciona una capa de abstracción sobre Axios para:
 * - Manejo centralizado de errores
 * - Interceptors para autenticación
 * - Transformación de respuestas
 * - Retry logic (futuro)
 */
export class HttpClient {
    constructor(baseURL) {
        this.client = axios.create({
            baseURL: baseURL || import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.setupInterceptors();
    }

    /**
     * Configurar interceptors de request y response
     */
    setupInterceptors() {
        // Request interceptor - Agregar token de autenticación
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor - Manejo de errores
        this.client.interceptors.response.use(
            (response) => response,
            (error) => this.handleError(error)
        );
    }

    /**
     * Manejo centralizado de errores HTTP
     */
    handleError(error) {
        if (error.response) {
            // El servidor respondió con un código de error
            const { status, data } = error.response;

            // 401 - No autorizado
            if (status === 401) {
                console.warn('⚠️ Sesión expirada');
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/login') && !currentPath.match(/^\/[^\/]+$/)) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            }

            // 404 - No encontrado
            if (status === 404) {
                throw new NetworkError(
                    data?.message || 'Recurso no encontrado',
                    status,
                    error
                );
            }

            // 500 - Error del servidor
            if (status >= 500) {
                throw new NetworkError(
                    'Error del servidor. Por favor intenta más tarde.',
                    status,
                    error
                );
            }

            // Otros errores
            throw new NetworkError(
                data?.message || 'Error en la solicitud',
                status,
                error
            );
        } else if (error.request) {
            // La solicitud se hizo pero no hubo respuesta
            throw new NetworkError(
                'No se pudo conectar con el servidor. Verifica tu conexión.',
                null,
                error
            );
        } else {
            // Error al configurar la solicitud
            throw new InfrastructureError(
                'Error al procesar la solicitud',
                error
            );
        }
    }

    /**
     * GET request
     */
    async get(url, config = {}) {
        try {
            const response = await this.client.get(url, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * POST request
     */
    async post(url, data = {}, config = {}) {
        try {
            const response = await this.client.post(url, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * PUT request
     */
    async put(url, data = {}, config = {}) {
        try {
            const response = await this.client.put(url, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * DELETE request
     */
    async delete(url, config = {}) {
        try {
            const response = await this.client.delete(url, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * PATCH request
     */
    async patch(url, data = {}, config = {}) {
        try {
            const response = await this.client.patch(url, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

// Instancia singleton del HttpClient
export const httpClient = new HttpClient();
