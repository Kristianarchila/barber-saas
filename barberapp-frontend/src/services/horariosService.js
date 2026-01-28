/**
 * @file horariosService.js
 * @description Servicio para gestión de horarios de barberos (rol: BARBERIA_ADMIN)
 * 
 * Gestión de disponibilidad horaria de cada barbero
 * 
 * 🔐 Autenticación: Requiere token JWT con rol BARBERIA_ADMIN
 * 🏢 Multi-tenant: Todas las rutas están bajo /api/barberias/:slug/admin/horarios
 * 📍 Slug: Se obtiene automáticamente de la URL
 */

import api from "./api";

/**
 * Obtiene el slug de la barbería actual desde la URL del navegador
 * @returns {string} slug de la barbería
 */
function getSlugActual() {
  return window.location.pathname.split("/")[1];
}

/**
 * Obtiene los horarios de un barbero
 * @param {string} barberoId - ID del barbero
 * @returns {Promise<Object>} Horarios del barbero
 * @endpoint GET /api/barberias/:slug/admin/horarios/barberos/:barberoId
 */
export async function getHorarios(barberoId) {
  const slug = getSlugActual();
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
  const slug = getSlugActual();
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
  const slug = getSlugActual();
  const res = await api.patch(`/barberias/${slug}/admin/horarios/${id}/activar`);
  return res.data;
}
