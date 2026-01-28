/**
 * @file dashboardService.js
 * @description Servicio para dashboard del admin (rol: BARBERIA_ADMIN)
 * 
 * Métricas y estadísticas generales de la barbería
 * 
 * 🔐 Autenticación: Requiere token JWT con rol BARBERIA_ADMIN
 * 🏢 Multi-tenant: Todas las rutas están bajo /api/barberias/:slug/admin/*
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
 * Obtiene las métricas del dashboard admin
 * @param {Object} params - Parámetros opcionales (fechaInicio, fechaFin)
 * @returns {Promise<Object>} Métricas del dashboard
 * @endpoint GET /api/barberias/:slug/admin/dashboard
 */
export async function getDashboardAdmin(params = {}) {
  const slug = getSlugActual();
  const queryParams = new URLSearchParams(params).toString();
  const url = `/barberias/${slug}/admin/dashboard${queryParams ? `?${queryParams}` : ''}`;
  const res = await api.get(url);
  return res.data;
}

/**
 * Obtiene las últimas reservas
 * @returns {Promise<Array>} Lista de últimas reservas
 * @endpoint GET /api/barberias/:slug/admin/reservas/ultimas
 */
export async function getUltimasReservas() {
  const slug = getSlugActual();
  const res = await api.get(`/barberias/${slug}/admin/reservas/ultimas`);
  return res.data;
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
  return res.data;
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
  return res.data;
}
