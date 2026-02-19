import api from './api';

/**
 * Obtiene el slug de la barbería actual desde la URL
 */
function getSlugActual() {
    return window.location.pathname.split("/")[1];
}

/**
 * Obtiene la disponibilidad horaria del barbero
 * @returns {Promise<Object>} Horarios configurados
 */
export async function getDisponibilidad() {
    const slug = getSlugActual();
    const res = await api.get(`/barberias/${slug}/barbero/disponibilidad`);
    return res.data;
}

/**
 * Actualiza la disponibilidad horaria del barbero
 * @param {Object} horarios - Configuración de horarios por día
 * @returns {Promise<Object>} Horarios actualizados
 */
export async function updateDisponibilidad(horarios) {
    const slug = getSlugActual();
    const res = await api.patch(`/barberias/${slug}/barbero/disponibilidad`, { horarios });
    return res.data;
}
