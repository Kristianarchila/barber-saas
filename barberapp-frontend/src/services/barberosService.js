import api from "./api";
import { getSlug } from "../utils/slugUtils";

/**
 * Lista todos los barberos de la barbería actual
 * @param {string} slugOverride - Opcional: slug de la barbería
 * @returns {Promise<Array>} Lista de barberos
 * @endpoint GET /api/barberias/:slug/barbero
 */
export async function getBarberos(slugOverride) {
  const slug = getSlug(slugOverride);
  const res = await api.get(`/barberias/${slug}/barbero`);
  return res.data.barberos;
}


/**
 * Crea un nuevo barbero con su usuario asociado
 * @param {Object} data - Datos del barbero (nombre, email, password, etc.)
 * @returns {Promise<Object>} Barbero creado
 * @endpoint POST /api/barberias/:slug/barbero
 */
export async function crearBarbero(data) {
  const slug = getSlugActual();
  const res = await api.post(`/barberias/${slug}/barbero`, data);
  return res.data;
}

/**
 * Actualiza los datos de un barbero existente
 * @param {string} id - ID del barbero
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Barbero actualizado
 * @endpoint PUT /api/barberias/:slug/barbero/:id
 */
export async function editarBarbero(id, data) {
  const slug = getSlugActual();
  const res = await api.put(`/barberias/${slug}/barbero/${id}`, data);
  return res.data;
}

/**
 * Elimina un barbero y su usuario asociado
 * @param {string} id - ID del barbero
 * @returns {Promise<Object>} Confirmación de eliminación
 * @endpoint DELETE /api/barberias/:slug/barbero/:id
 */
export async function eliminarBarbero(id) {
  const slug = getSlugActual();
  const res = await api.delete(`/barberias/${slug}/barbero/${id}`);
  return res.data;
}

/**
 * Activa o desactiva un barbero
 * @param {string} id - ID del barbero
 * @returns {Promise<Object>} Estado actualizado
 * @endpoint PATCH /api/barberias/:slug/barbero/:id/toggle
 */
export async function toggleEstadoBarbero(id) {
  const slug = getSlugActual();
  const res = await api.patch(`/barberias/${slug}/barbero/${id}/toggle`);
  return res.data;
}
