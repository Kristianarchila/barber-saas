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
import { getSlug } from "../utils/slugUtils";
import dayjs from "dayjs";

/**
 * Obtiene la agenda del barbero para una fecha específica
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Promise<Array>} Lista de reservas del día
 * @endpoint GET /api/barberias/:slug/barbero/agenda?fecha=YYYY-MM-DD
 */
export async function getAgendaBarbero(fecha) {
  const slug = getSlug();
  const res = await api.get(
    `/barberias/${slug}/barbero/agenda?fecha=${fecha}`
  );
  return res.data || [];
}

/**
 * Obtiene la agenda del barbero para un rango de fechas (weekly/monthly views)
 * @param {string} fechaInicio - Fecha inicio en formato YYYY-MM-DD
 * @param {string} fechaFin - Fecha fin en formato YYYY-MM-DD
 * @returns {Promise<Array>} Lista de reservas en el rango
 */
export async function getAgendaBarberoRange(fechaInicio, fechaFin) {
  const slug = getSlug();
  const res = await api.get(
    `/barberias/${slug}/barbero/agenda?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
  );
  return res.data || [];
}

/**
 * Obtiene el historial completo de citas del barbero
 * @returns {Promise<Array>} Lista de todas las citas (pasadas y futuras)
 * @endpoint GET /api/barberias/:slug/barbero/mis-citas
 */
export async function getCitasBarbero() {
  const slug = getSlug();
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
  const slug = getSlug();
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
  const slug = getSlug();
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
  const slug = getSlug();
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
  const slug = getSlug();
  const res = await api.get(
    `/barberias/${slug}/barbero/estadisticas`
  );
  return res.data;
}

/**
 * Actualiza el perfil del barbero autenticado
 * @param {Object} perfilData - Datos del perfil a actualizar (nombre, telefono, bio, especialidades, etc.)
 * @returns {Promise<Object>} Perfil actualizado
 * @endpoint PATCH /api/barberias/:slug/barbero/mi-perfil
 */
export async function updatePerfilBarbero(perfilData) {
  const slug = getSlug();
  const res = await api.patch(
    `/barberias/${slug}/barbero/mi-perfil`,
    perfilData
  );
  return res.data;
}

