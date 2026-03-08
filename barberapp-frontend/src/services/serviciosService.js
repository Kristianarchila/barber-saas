/**
 * @file serviciosService.js
 * @description Servicio para gestión de servicios (rol: BARBERIA_ADMIN)
 * 
 * CRUD de servicios de la barbería
 * 
 * 🔐 Autenticación: Requiere token JWT con rol BARBERIA_ADMIN
 * 🏢 Multi-tenant: Todas las rutas están bajo /api/barberias/:slug/admin/servicios
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
 * Obtiene todos los servicios de la barbería
 * @param {string} slugOverride - Opcional: slug de la barbería
 * @returns {Promise<Array>} Lista de servicios
 * @endpoint GET /api/barberias/:slug/admin/servicios
 */
export async function getServicios(slugOverride) {
  const slug = slugOverride || getSlugActual();
  const res = await api.get(`/barberias/${slug}/admin/servicios`);

  // Arquitectura hexagonal devuelve: { total: number, servicios: Array }
  // Retornamos solo el array de servicios para compatibilidad
  return res.data.servicios || res.data;
}

/**
 * Crea un nuevo servicio
 * @param {Object} data - Datos del servicio (nombre, precio, duracion, etc.)
 * @returns {Promise<Object>} Servicio creado
 * @endpoint POST /api/barberias/:slug/admin/servicios
 */
export async function crearServicio(data) {
  const slug = getSlugActual();
  const res = await api.post(`/barberias/${slug}/admin/servicios`, data);

  // Arquitectura hexagonal devuelve: { message: string, servicio: Object }
  return res.data.servicio || res.data;
}

/**
 * Actualiza un servicio existente
 * @param {string} id - ID del servicio
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Servicio actualizado
 * @endpoint PUT /api/barberias/:slug/admin/servicios/:id
 */
export async function editarServicio(id, data) {
  const slug = getSlugActual();
  const res = await api.put(`/barberias/${slug}/admin/servicios/${id}`, data);

  // Arquitectura hexagonal devuelve: { message: string, servicio: Object }
  return res.data.servicio || res.data;
}

/**
 * Cambia el estado activo/inactivo de un servicio
 * @param {string} id - ID del servicio
 * @param {boolean} activo - Nuevo estado
 * @returns {Promise<Object>} Servicio actualizado
 * @endpoint PATCH /api/barberias/:slug/admin/servicios/:id
 */
export async function cambiarEstadoServicio(id, activo) {
  const slug = getSlugActual();
  const res = await api.patch(`/barberias/${slug}/admin/servicios/${id}`, { activo });
  return res.data.servicio || res.data;
}

/**
 * Obtiene las categorías personalizadas de la barbería
 */
export async function getCategorias() {
  const slug = getSlugActual();
  const res = await api.get(`/barberias/${slug}/public`);
  return (res.data?.configuracion?.categorias || []).sort((a, b) => a.orden - b.orden);
}

/**
 * Guarda (reemplaza) las categorías personalizadas de la barbería
 * @param {Array} categorias - [{nombre, orden}]
 */
export async function saveCategorias(categorias) {
  const slug = getSlugActual();
  const res = await api.put(`/barberias/${slug}/admin/config`, {
    configuracion: { categorias }
  });
  return res.data;
}
