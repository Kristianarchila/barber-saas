import api from "./api";
import { getSlug } from "../utils/slugUtils";

/**
 * Crea un nuevo bloqueo
 * @param {Object} bloqueoData - Datos del bloqueo
 * @returns {Promise<Object>} Bloqueo creado
 * @endpoint POST /api/barberias/:slug/admin/bloqueos
 */
export async function crearBloqueo(bloqueoData) {
    const slug = getSlug();
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
    const slug = getSlug();
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
    const slug = getSlug();
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
    const slug = getSlug();
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
    const slug = getSlug();
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
