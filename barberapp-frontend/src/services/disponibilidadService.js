import api from './api';
import { getSlug } from "../utils/slugUtils";

/**
 * Obtiene la disponibilidad horaria del barbero
 * @returns {Promise<Object>} Horarios configurados
 */
export async function getDisponibilidad() {
    const slug = getSlug();
    const res = await api.get(`/barberias/${slug}/barbero/disponibilidad`);
    return res.data;
}

/**
 * Actualiza la disponibilidad horaria del barbero
 * @param {Object} horarios - Configuración de horarios por día
 * @returns {Promise<Object>} Horarios actualizados
 */
export async function updateDisponibilidad(horarios) {
    const slug = getSlug();
    const res = await api.patch(`/barberias/${slug}/barbero/disponibilidad`, { horarios });
    return res.data;
}
