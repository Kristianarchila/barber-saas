import api from "./api";

/**
 * @file bloqueosService.js
 * @description Service for managing date/time blockings (admin only)
 * 
 * 🔐 Autenticación: Requiere token JWT con rol BARBERIA_ADMIN
 * 🏢 Multi-tenant: Todas las rutas están bajo /api/barberias/:slug/admin/bloqueos
 * 📍 Slug: Se obtiene automáticamente de la URL
 */

/**
 * Obtiene el slug de la barbería actual desde la URL del navegador
 * @returns {string} slug de la barbería
 */
function getSlugActual() {
    return window.location.pathname.split("/")[1];
}

/**
 * Crea un nuevo bloqueo
 * @param {Object} bloqueoData - Datos del bloqueo
 * @returns {Promise<Object>} Bloqueo creado
 * @endpoint POST /api/barberias/:slug/admin/bloqueos
 */
export async function crearBloqueo(bloqueoData) {
    const slug = getSlugActual();
    const res = await api.post(`/barberias/${slug}/admin/bloqueos`, bloqueoData);
    return res.data.data;
}

/**
 * Obtiene todos los bloqueos de la barbería
 * @param {Object} filters - Filtros opcionales (activo, tipo, barberoId)
 * @returns {Promise<Array>} Lista de bloqueos
 * @endpoint GET /api/barberias/:slug/admin/bloqueos
 */
export async function obtenerBloqueos(filters = {}) {
    const slug = getSlugActual();
    const params = new URLSearchParams(filters).toString();
    const res = await api.get(`/barberias/${slug}/admin/bloqueos${params ? `?${params}` : ''}`);
    return res.data.data;
}

/**
 * Obtiene bloqueos para un rango de fechas
 * @param {string} fechaInicio - Fecha inicio (YYYY-MM-DD)
 * @param {string} fechaFin - Fecha fin (YYYY-MM-DD)
 * @param {string} barberoId - ID del barbero (opcional)
 * @returns {Promise<Array>} Lista de bloqueos
 * @endpoint GET /api/barberias/:slug/admin/bloqueos/rango
 */
export async function obtenerBloqueosPorRango(fechaInicio, fechaFin, barberoId = null) {
    const slug = getSlugActual();
    const params = { fechaInicio, fechaFin };
    if (barberoId) params.barberoId = barberoId;

    const queryString = new URLSearchParams(params).toString();
    const res = await api.get(`/barberias/${slug}/admin/bloqueos/rango?${queryString}`);
    return res.data.data;
}

/**
 * Obtiene bloqueos para una fecha específica
 * @param {string} fecha - Fecha (YYYY-MM-DD)
 * @param {string} barberoId - ID del barbero (opcional)
 * @returns {Promise<Array>} Lista de bloqueos
 * @endpoint GET /api/barberias/:slug/admin/bloqueos/fecha/:fecha
 */
export async function obtenerBloqueosPorFecha(fecha, barberoId = null) {
    const slug = getSlugActual();
    const params = barberoId ? `?barberoId=${barberoId}` : '';
    const res = await api.get(`/barberias/${slug}/admin/bloqueos/fecha/${fecha}${params}`);
    return res.data.data;
}

/**
 * Elimina (desactiva) un bloqueo
 * @param {string} id - ID del bloqueo
 * @returns {Promise<void>}
 * @endpoint DELETE /api/barberias/:slug/admin/bloqueos/:id
 */
export async function eliminarBloqueo(id) {
    const slug = getSlugActual();
    const res = await api.delete(`/barberias/${slug}/admin/bloqueos/${id}`);
    return res.data;
}

export default {
    crearBloqueo,
    obtenerBloqueos,
    obtenerBloqueosPorRango,
    obtenerBloqueosPorFecha,
    eliminarBloqueo
};
