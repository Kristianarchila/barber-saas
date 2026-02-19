/**
 * @file finanzasService.js
 * @description Servicio para gestión financiera (rol: BARBERIA_ADMIN)
 * 
 * Reportes y métricas financieras de la barbería
 * 
 * 🔐 Autenticación: Requiere token JWT con rol BARBERIA_ADMIN
 * 🏢 Multi-tenant: Todas las rutas están bajo /api/barberias/:slug/admin/finanzas
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
 * Obtiene el resumen financiero de la barbería
 * @param {Object} params - Parámetros de filtro (fechaInicio, fechaFin)
 * @returns {Promise<Object>} Resumen financiero
 * @endpoint GET /api/barberias/:slug/admin/finanzas/resumen
 */
export async function getFinanzasAdmin(params = {}) {
  const slug = getSlugActual();
  const queryParams = new URLSearchParams(params).toString();
  const url = `/barberias/${slug}/admin/finanzas/resumen${queryParams ? `?${queryParams}` : ""}`;
  const res = await api.get(url);
  return res.data;
}

// --- GESTIÓN DE CAJA ---

export async function getCajaActual() {
  const slug = getSlugActual();
  const res = await api.get(`/barberias/${slug}/admin/caja/actual`);
  return res.data;
}

export async function abrirCaja(data) {
  const slug = getSlugActual();
  const res = await api.post(`/barberias/${slug}/admin/caja/abrir`, data);
  return res.data;
}

export async function cerrarCaja(data) {
  const slug = getSlugActual();
  const res = await api.post(`/barberias/${slug}/admin/caja/cerrar`, data);
  return res.data;
}

export async function getHistorialCajas(params = {}) {
  const slug = getSlugActual();
  const queryParams = new URLSearchParams(params).toString();
  const res = await api.get(`/barberias/${slug}/admin/caja/historial?${queryParams}`);
  return res.data;
}

// --- GESTIÓN DE EGRESOS ---

export async function getEgresos(params = {}) {
  const slug = getSlugActual();
  const queryParams = new URLSearchParams(params).toString();
  const res = await api.get(`/barberias/${slug}/admin/egresos?${queryParams}`);
  return res.data;
}

export async function registrarEgreso(data) {
  const slug = getSlugActual();
  const res = await api.post(`/barberias/${slug}/admin/egresos`, data);
  return res.data;
}

// --- TRANSACCIONES & REPORTES ---

export async function getTransactions(params = {}) {
  const slug = getSlugActual();
  const queryParams = new URLSearchParams(params).toString();
  const res = await api.get(`/barberias/${slug}/transactions/admin?${queryParams}`);
  return res.data;
}

export async function getReporteGeneral(params = {}) {
  const slug = getSlugActual();
  const queryParams = new URLSearchParams(params).toString();
  const res = await api.get(`/barberias/${slug}/admin/reportes/resumen-general?${queryParams}`);
  return res.data;
}
