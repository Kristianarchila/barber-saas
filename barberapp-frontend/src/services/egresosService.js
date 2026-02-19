/**
 * @file egresosService.js
 * @description Servicio para gestión de egresos (rol: BARBERIA_ADMIN)
 * 
 * Registra y gestiona gastos categorizados
 * 
 * 🔐 Autenticación: Requiere token JWT con rol BARBERIA_ADMIN
 * 🏢 Multi-tenant: Todas las rutas están bajo /api/barberias/:slug/admin/egresos
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
 * Registrar nuevo egreso
 * @param {Object} egresoData - Datos del egreso
 * @returns {Promise<Object>} Egreso creado
 * @endpoint POST /api/barberias/:slug/admin/egresos
 */
export async function registrarEgreso(egresoData) {
    const slug = getSlugActual();
    const res = await api.post(`/barberias/${slug}/admin/egresos`, egresoData);
    return res.data;
}

/**
 * Obtener egresos con filtros
 * @param {Object} filtros - Filtros opcionales
 * @returns {Promise<Array>} Lista de egresos
 * @endpoint GET /api/barberias/:slug/admin/egresos
 */
export async function obtenerEgresos(filtros = {}) {
    const slug = getSlugActual();
    const queryParams = new URLSearchParams(filtros).toString();
    const url = `/barberias/${slug}/admin/egresos${queryParams ? `?${queryParams}` : ''}`;
    const res = await api.get(url);
    return res.data;
}

/**
 * Obtener resumen de egresos
 * @param {string} mes - Mes en formato YYYY-MM
 * @returns {Promise<Object>} Resumen de egresos
 * @endpoint GET /api/barberias/:slug/admin/egresos/resumen
 */
export async function obtenerResumenEgresos(mes) {
    const slug = getSlugActual();
    const queryParams = mes ? `?mes=${mes}` : '';
    const res = await api.get(`/barberias/${slug}/admin/egresos/resumen${queryParams}`);
    return res.data;
}

/**
 * Actualizar egreso
 * @param {string} id - ID del egreso
 * @param {Object} egresoData - Datos actualizados
 * @returns {Promise<Object>} Egreso actualizado
 * @endpoint PUT /api/barberias/:slug/admin/egresos/:id
 */
export async function actualizarEgreso(id, egresoData) {
    const slug = getSlugActual();
    const res = await api.put(`/barberias/${slug}/admin/egresos/${id}`, egresoData);
    return res.data;
}

/**
 * Eliminar egreso
 * @param {string} id - ID del egreso
 * @returns {Promise<Object>} Confirmación
 * @endpoint DELETE /api/barberias/:slug/admin/egresos/:id
 */
export async function eliminarEgreso(id) {
    const slug = getSlugActual();
    const res = await api.delete(`/barberias/${slug}/admin/egresos/${id}`);
    return res.data;
}

/**
 * Categorías de egresos disponibles
 */
export const CATEGORIAS_EGRESOS = [
    { value: 'ARRIENDO', label: 'Arriendo' },
    { value: 'SERVICIOS_BASICOS', label: 'Servicios Básicos' },
    { value: 'SUELDOS', label: 'Sueldos' },
    { value: 'COMISIONES', label: 'Comisiones' },
    { value: 'PRODUCTOS', label: 'Productos' },
    { value: 'EQUIPAMIENTO', label: 'Equipamiento' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'IMPUESTOS', label: 'Impuestos' },
    { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
    { value: 'OTROS', label: 'Otros' }
];
