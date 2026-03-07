/**
 * @file reservasService.js
 * @description Servicio para gestión de reservas (rol: BARBERIA_ADMIN)
 * 
 * CRUD de reservas y operaciones relacionadas
 * 
 * 🔐 Autenticación: Requiere token JWT con rol BARBERIA_ADMIN
 * 🏢 Multi-tenant: Todas las rutas están bajo /api/barberias/:slug/admin/reservas
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
 * Crea una nueva reserva para un barbero
 * @param {string} barberoId - ID del barbero
 * @param {Object} reservaData - Datos de la reserva
 * @returns {Promise<Object>} Reserva creada
 * @endpoint POST /api/barberias/:slug/admin/reservas/barberos/:barberoId/reservar
 */
export async function crearReserva(barberoId, reservaData) {
  const slug = getSlugActual();
  const res = await api.post(
    `/barberias/${slug}/admin/reservas/barberos/${barberoId}/reservar`,
    reservaData
  );

  // Arquitectura hexagonal devuelve: { message: string, reserva: Object }
  return res.data.reserva || res.data;
}

/**
 * Obtiene las reservas de un barbero para una fecha específica
 * @param {string} barberoId - ID del barbero
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Promise<Array>} Lista de reservas
 * @endpoint GET /api/barberias/:slug/admin/reservas/barberos/:barberoId?fecha=YYYY-MM-DD
 */
export async function getReservasPorBarberoDia(barberoId, fecha) {
  const slug = getSlugActual();
  const res = await api.get(`/barberias/${slug}/admin/reservas/barberos/${barberoId}?fecha=${fecha}`);
  return res.data.reservas || [];
}

/**
 * Marca una reserva como completada
 * @param {string} id - ID de la reserva
 * @returns {Promise<Object>} Reserva actualizada
 * @endpoint PATCH /api/barberias/:slug/admin/reservas/:id/completar
 */
export async function completarReserva(id) {
  const slug = getSlugActual();
  const res = await api.patch(`/barberias/${slug}/admin/reservas/${id}/completar`);

  // Arquitectura hexagonal devuelve: { message: string, reserva: Object }
  return res.data.reserva || res.data;
}

/**
 * Cancela una reserva
 * @param {string} id - ID de la reserva
 * @returns {Promise<Object>} Reserva cancelada
 * @endpoint PATCH /api/barberias/:slug/admin/reservas/:id/cancelar
 */
export async function cancelarReserva(id) {
  const slug = getSlugActual();
  const res = await api.patch(`/barberias/${slug}/admin/reservas/${id}/cancelar`);

  // Arquitectura hexagonal devuelve: { message: string, reserva: Object }
  return res.data.reserva || res.data;
}

/**
 * Obtiene el historial de reservas con filtros opcionales
 * @param {Object} filters - Filtros (fecha, estado, barberoId, etc.)
 * @returns {Promise<Array>} Lista de reservas
 * @endpoint GET /api/barberias/:slug/admin/reservas
 */
export async function getHistorialReservas(filters = {}) {
  const slug = getSlugActual();
  const params = new URLSearchParams(filters).toString();
  const res = await api.get(`/barberias/${slug}/admin/reservas${params ? `?${params}` : ''}`);
  return res.data.reservas || [];
}

/**
 * Reagenda una reserva existente a una nueva fecha/hora
 * @param {string} id - ID de la reserva
 * @param {Object} data - { fecha: 'YYYY-MM-DD', hora: 'HH:MM' }
 * @returns {Promise<Object>} Reserva actualizada
 * @endpoint PATCH /api/barberias/:slug/admin/reservas/:id/reagendar
 */
export async function reagendarReserva(id, data) {
  const slug = getSlugActual();
  const res = await api.patch(`/barberias/${slug}/admin/reservas/${id}/reagendar`, data);
  return res.data.reserva || res.data;
}