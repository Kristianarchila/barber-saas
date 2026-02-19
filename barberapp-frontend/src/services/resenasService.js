import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/**
 * ========================================
 * MÉTODOS PÚBLICOS (sin autenticación)
 * ========================================
 */

/**
 * Validar token de reseña
 */
export const validarToken = async (slug, token) => {
    try {
        const response = await axios.get(
            `${API_URL}/public/barberias/${slug}/resenas/validar-token`,
            { params: { reviewToken: token } }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Crear reseña con token
 */
export const crearResena = async (slug, token, data) => {
    try {
        const response = await axios.post(
            `${API_URL}/public/barberias/${slug}/resenas`,
            data,
            { params: { reviewToken: token } }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Obtener reseñas públicas aprobadas
 */
export const obtenerResenasPublicas = async (slug, params = {}) => {
    try {
        const response = await axios.get(
            `${API_URL}/public/barberias/${slug}/resenas`,
            { params }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Obtener estadísticas públicas
 */
export const obtenerEstadisticasPublicas = async (slug) => {
    try {
        const response = await axios.get(
            `${API_URL}/public/barberias/${slug}/resenas/stats`
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * ========================================
 * MÉTODOS ADMIN (requieren autenticación)
 * ========================================
 */

/**
 * Obtener reseñas pendientes de moderación
 */
export const obtenerResenasPendientes = () => {
    const token = localStorage.getItem("token");
    return axios.get(`${API_URL}/admin/resenas/pendientes`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

/**
 * Obtener reseñas aprobadas
 */
export const obtenerResenasAprobadas = (visible = null) => {
    const token = localStorage.getItem("token");
    const params = visible !== null ? { visible } : {};
    return axios.get(`${API_URL}/admin/resenas/aprobadas`, {
        headers: { Authorization: `Bearer ${token}` },
        params
    });
};

/**
 * Obtener estadísticas detalladas (admin)
 */
export const obtenerEstadisticas = () => {
    const token = localStorage.getItem("token");
    return axios.get(`${API_URL}/admin/resenas/estadisticas`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

/**
 * Aprobar reseña
 */
export const aprobarResena = (resenaId) => {
    const token = localStorage.getItem("token");
    return axios.patch(
        `${API_URL}/admin/resenas/${resenaId}/aprobar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
    );
};

/**
 * Ocultar reseña
 */
export const ocultarResena = (resenaId) => {
    const token = localStorage.getItem("token");
    return axios.patch(
        `${API_URL}/admin/resenas/${resenaId}/ocultar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
    );
};

/**
 * Mostrar reseña
 */
export const mostrarResena = (resenaId) => {
    const token = localStorage.getItem("token");
    return axios.patch(
        `${API_URL}/admin/resenas/${resenaId}/mostrar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
    );
};

/**
 * ✅ NUEVO: Responder a reseña
 */
export const responderResena = (resenaId, texto) => {
    const token = localStorage.getItem("token");
    return axios.patch(
        `${API_URL}/admin/resenas/${resenaId}/responder`,
        { texto },
        { headers: { Authorization: `Bearer ${token}` } }
    );
};

export default {
    // Públicos
    validarToken,
    crearResena,
    obtenerResenasPublicas,
    obtenerEstadisticasPublicas,
    // Admin
    obtenerResenasPendientes,
    obtenerResenasAprobadas,
    obtenerEstadisticas,
    aprobarResena,
    ocultarResena,
    mostrarResena,
    responderResena
};
