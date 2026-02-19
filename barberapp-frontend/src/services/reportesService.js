/**
 * @file reportesService.js
 * @description Servicio para obtener reportes y estadísticas del negocio
 * 
 * 🔐 Autenticación: Requiere token JWT con rol BARBERIA_ADMIN
 * 🏢 Multi-tenant: Todas las rutas están bajo /api/barberias/:slug/admin/reportes
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
 * Obtener resumen general del negocio
 * @param {string} mes - Mes en formato YYYY-MM
 * @returns {Promise<Object>} Resumen general
 */
export async function obtenerResumenGeneral(mes, desde, hasta) {
    const slug = getSlugActual();
    let queryParams = '';
    if (mes) queryParams = `?mes=${mes}`;
    else if (desde && hasta) queryParams = `?desde=${desde}&hasta=${hasta}`;

    const res = await api.get(`/barberias/${slug}/admin/reportes/resumen-general${queryParams}`);
    return res.data;
}

/**
 * Obtener rendimiento por barbero
 * @param {string} mes - Mes en formato YYYY-MM
 * @returns {Promise<Array>} Rendimiento de cada barbero
 */
export async function obtenerRendimientoBarberos(mes, desde, hasta) {
    const slug = getSlugActual();
    let queryParams = '';
    if (mes) queryParams = `?mes=${mes}`;
    else if (desde && hasta) queryParams = `?desde=${desde}&hasta=${hasta}`;

    const res = await api.get(`/barberias/${slug}/admin/reportes/rendimiento-barberos${queryParams}`);
    return res.data;
}

/**
 * Obtener servicios más vendidos
 * @param {string} mes - Mes en formato YYYY-MM
 * @returns {Promise<Object>} Servicios vendidos
 */
export async function obtenerServiciosVendidos(mes, desde, hasta) {
    const slug = getSlugActual();
    let queryParams = '';
    if (mes) queryParams = `?mes=${mes}`;
    else if (desde && hasta) queryParams = `?desde=${desde}&hasta=${hasta}`;

    const res = await api.get(`/barberias/${slug}/admin/reportes/servicios-vendidos${queryParams}`);
    return res.data;
}

/**
 * Obtener análisis de métodos de pago
 * @param {string} mes - Mes en formato YYYY-MM
 * @returns {Promise<Object>} Análisis de pagos
 */
export async function obtenerAnalisisPagos(mes, desde, hasta) {
    const slug = getSlugActual();
    let queryParams = '';
    if (mes) queryParams = `?mes=${mes}`;
    else if (desde && hasta) queryParams = `?desde=${desde}&hasta=${hasta}`;

    const res = await api.get(`/barberias/${slug}/admin/reportes/analisis-pagos${queryParams}`);
    return res.data;
}

/**
 * Obtener tendencias de ingresos
 * @param {string} mes - Mes en formato YYYY-MM
 * @returns {Promise<Array>} Tendencias por día
 */
export async function obtenerTendenciasIngresos(mes, desde, hasta) {
    const slug = getSlugActual();
    let queryParams = '';
    if (mes) queryParams = `?mes=${mes}`;
    else if (desde && hasta) queryParams = `?desde=${desde}&hasta=${hasta}`;

    const res = await api.get(`/barberias/${slug}/admin/reportes/tendencias${queryParams}`);
    return res.data;
}
