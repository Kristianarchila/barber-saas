import api from './api';

/**
 * Cliente Stats Service
 * Handles all API calls related to client statistics and blocking
 */

/**
 * Helper function to get current barberia slug from URL
 */
function getSlugActual() {
    return window.location.pathname.split('/')[1];
}

/**
 * Get all client statistics for a barberia
 * @param {Object} filters - Optional filters { bloqueado, email, limit, offset }
 * @returns {Promise<Object>} { stats: Array, total: number }
 */
export const getClienteStats = async (filters = {}) => {
    const slug = getSlugActual();
    const params = new URLSearchParams();

    if (filters.bloqueado !== undefined) params.append('bloqueado', filters.bloqueado);
    if (filters.email) params.append('email', filters.email);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    const url = `/barberias/${slug}/admin/cliente-stats${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data;
};

/**
 * Get statistics for a specific client
 * @param {string} email - Client email
 * @returns {Promise<Object>} Client statistics
 */
export const getClienteStatsByEmail = async (email) => {
    const slug = getSlugActual();
    const response = await api.get(`/barberias/${slug}/admin/cliente-stats/${encodeURIComponent(email)}`);
    return response.data;
};

/**
 * Manually block a client
 * @param {string} email - Client email
 * @param {Object} data - { motivo: string, diasBloqueo: number }
 * @returns {Promise<Object>} Updated client stats
 */
export const bloquearCliente = async (email, data) => {
    const slug = getSlugActual();
    const response = await api.post(
        `/barberias/${slug}/admin/cliente-stats/${encodeURIComponent(email)}/bloquear`,
        data
    );
    return response.data;
};

/**
 * Manually unblock a client
 * @param {string} email - Client email
 * @returns {Promise<Object>} Updated client stats
 */
export const desbloquearCliente = async (email) => {
    const slug = getSlugActual();
    const response = await api.post(
        `/barberias/${slug}/admin/cliente-stats/${encodeURIComponent(email)}/desbloquear`
    );
    return response.data;
};

/**
 * Reset monthly cancellation counter for a client
 * @param {string} email - Client email
 * @returns {Promise<Object>} Updated client stats
 */
export const resetCancelaciones = async (email) => {
    const slug = getSlugActual();
    const response = await api.post(
        `/barberias/${slug}/admin/cliente-stats/${encodeURIComponent(email)}/reset-cancelaciones`
    );
    return response.data;
};

/**
 * Get summary statistics
 * @returns {Promise<Object>} { totalClientes, clientesBloqueados, cancelacionesEsteMes }
 */
export const getResumenStats = async () => {
    const slug = getSlugActual();
    const response = await api.get(`/barberias/${slug}/admin/cliente-stats/resumen`);
    return response.data;
};

export default {
    getClienteStats,
    getClienteStatsByEmail,
    bloquearCliente,
    desbloquearCliente,
    resetCancelaciones,
    getResumenStats
};
