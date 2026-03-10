import api from "./api";
import { getSlug } from "../utils/slugUtils";

/**
 * Obtiene los horarios de un barbero
 * @param {string} barberoId - ID del barbero
 * @returns {Promise<Object>} Horarios del barbero
 * @endpoint GET /api/barberias/:slug/admin/horarios/barberos/:barberoId
 */
export async function getHorarios(barberoId) {
  const slug = getSlug();
  const res = await api.get(`/barberias/${slug}/admin/horarios/barberos/${barberoId}`);
  return res.data;
}

/**
 * Guarda/actualiza los horarios de un barbero
 * @param {string} barberoId - ID del barbero
 * @param {Object} body - Configuración de horarios
 * @returns {Promise<Object>} Horarios guardados
 * @endpoint POST /api/barberias/:slug/admin/horarios/barberos/:barberoId
 */
export async function saveHorario(barberoId, body) {
  const slug = getSlug();
  const res = await api.post(`/barberias/${slug}/admin/horarios/barberos/${barberoId}`, body);
  return res.data;
}

/**
 * Activa o desactiva un horario
 * @param {string} id - ID del horario
 * @returns {Promise<Object>} Horario actualizado
 * @endpoint PATCH /api/barberias/:slug/admin/horarios/:id/activar
 */
export async function toggleHorario(id) {
  const slug = getSlug();
  const res = await api.patch(`/barberias/${slug}/admin/horarios/${id}/activar`);
  return res.data;
}

/**
 * Elimina un horario
 * @param {string} id - ID del horario
 * @returns {Promise<Object>} Confirmación
 * @endpoint DELETE /api/barberias/:slug/admin/horarios/:id
 */
export async function deleteHorario(id) {
  const slug = getSlug();
  const res = await api.delete(`/barberias/${slug}/admin/horarios/${id}`);
  return res.data;
}
