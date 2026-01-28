/**
 * @file barberoDashboardService.js
 * @description Servicio para Dashboard del BARBERO (rol: BARBERO)
 * 
 * Este servicio maneja todas las operaciones del dashboard del barbero:
 * - Ver agenda del día
 * - Historial de citas
 * - Perfil del barbero
 * - Completar/Cancelar reservas
 * 
 * 🔐 Autenticación: Requiere token JWT con rol BARBERO
 * 🏢 Multi-tenant: Todas las rutas están bajo /api/barberias/:slug/barbero/*
 * 📍 Slug: Se obtiene automáticamente de la URL actual (window.location)
 */

import api from "./api";

/**
 * Obtiene el slug de la barbería actual desde la URL del navegador
 * @returns {string} slug de la barbería (ej: "barberia-central")
 * @example
 * // URL: http://localhost:5173/barberia-central/barbero/dashboard
 * // Returns: "barberia-central"
 */
function getSlugActual() {
  return window.location.pathname.split("/")[1];
}

/**
 * Obtiene la agenda del barbero para una fecha específica
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Promise<Array>} Lista de reservas del día
 * @endpoint GET /api/barberias/:slug/barbero/agenda?fecha=YYYY-MM-DD
 */
export async function getAgendaBarbero(fecha) {
  const slug = getSlugActual();
  const res = await api.get(
    `/barberias/${slug}/barbero/agenda?fecha=${fecha}`
  );
  return res.data || [];
}

/**
 * Obtiene el historial completo de citas del barbero
 * @returns {Promise<Array>} Lista de todas las citas (pasadas y futuras)
 * @endpoint GET /api/barberias/:slug/barbero/mis-citas
 */
export async function getCitasBarbero() {
  const slug = getSlugActual();
  const res = await api.get(
    `/barberias/${slug}/barbero/mis-citas`
  );
  return res.data || [];
}

/**
 * Obtiene el perfil del barbero autenticado
 * @returns {Promise<Object>} Datos del perfil (nombre, email, especialidades, experiencia, etc.)
 * @endpoint GET /api/barberias/:slug/barbero/mi-perfil
 */
export async function getPerfilBarbero() {
  const slug = getSlugActual();
  const res = await api.get(
    `/barberias/${slug}/barbero/mi-perfil`
  );
  return res.data;
}

/**
 * Marca una reserva como completada
 * @param {string} reservaId - ID de la reserva a completar
 * @returns {Promise<Object>} Respuesta del servidor
 * @endpoint PATCH /api/barberias/:slug/barbero/reservas/:id/completar
 */
export async function completarReserva(reservaId) {
  const slug = getSlugActual();
  const res = await api.patch(
    `/barberias/${slug}/barbero/reservas/${reservaId}/completar`
  );
  return res.data;
}

/**
 * Cancela una reserva
 * @param {string} reservaId - ID de la reserva a cancelar
 * @returns {Promise<Object>} Respuesta del servidor
 * @endpoint PATCH /api/barberias/:slug/barbero/reservas/:id/cancelar
 */
export async function cancelarReserva(reservaId) {
  const slug = getSlugActual();
  const res = await api.patch(
    `/barberias/${slug}/barbero/reservas/${reservaId}/cancelar`
  );
  return res.data;
}

/**
 * Obtiene las estadísticas y métricas del barbero
 * @returns {Promise<Object>} Métricas de rendimiento (citas, ingresos, tasa cancelación, etc.)
 * @endpoint GET /api/barberias/:slug/barbero/estadisticas
 */
export async function getEstadisticasBarbero() {
  const slug = getSlugActual();
  const res = await api.get(
    `/barberias/${slug}/barbero/estadisticas`
  );
  return res.data;
}

