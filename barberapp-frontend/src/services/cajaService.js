/**
 * @file cajaService.js
 * @description Servicio para gestión de caja diaria (rol: BARBERIA_ADMIN)
 * 
 * Apertura, cierre y movimientos de caja
 * 
 * 🔐 Autenticación: Requiere token JWT con rol BARBERIA_ADMIN
 * 🏢 Multi-tenant: Todas las rutas están bajo /api/barberias/:slug/admin/caja
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
 * Abrir caja
 * @param {Object} cajaData - Datos de apertura
 * @param {number} cajaData.montoInicial - Monto inicial (fondo fijo)
 * @param {string} cajaData.turno - Turno (MAÑANA, TARDE, COMPLETO)
 * @returns {Promise<Object>} Caja abierta
 * @endpoint POST /api/barberias/:slug/admin/caja/abrir
 */
export async function abrirCaja(cajaData) {
    const slug = getSlugActual();
    const res = await api.post(`/barberias/${slug}/admin/caja/abrir`, cajaData);
    return res.data;
}

/**
 * Obtener caja actual (abierta)
 * @returns {Promise<Object>} Caja actual o null
 * @endpoint GET /api/barberias/:slug/admin/caja/actual
 */
export async function obtenerCajaActual() {
    const slug = getSlugActual();
    const res = await api.get(`/barberias/${slug}/admin/caja/actual`);
    return res.data;
}

/**
 * Agregar ingreso manual a caja
 * @param {Object} ingresoData - Datos del ingreso
 * @returns {Promise<Object>} Caja actualizada
 * @endpoint POST /api/barberias/:slug/admin/caja/ingresos
 */
export async function agregarIngreso(ingresoData) {
    const slug = getSlugActual();
    const res = await api.post(`/barberias/${slug}/admin/caja/ingresos`, ingresoData);
    return res.data;
}

/**
 * Agregar egreso a caja
 * @param {Object} egresoData - Datos del egreso
 * @returns {Promise<Object>} Caja actualizada
 * @endpoint POST /api/barberias/:slug/admin/caja/egresos
 */
export async function agregarEgreso(egresoData) {
    const slug = getSlugActual();
    const res = await api.post(`/barberias/${slug}/admin/caja/egresos`, egresoData);
    return res.data;
}

/**
 * Cerrar caja
 * @param {Object} cierreData - Datos de cierre
 * @param {number} cierreData.montoReal - Monto contado físicamente
 * @param {Object} cierreData.arqueo - Conteo por denominación
 * @param {string} cierreData.observaciones - Observaciones opcionales
 * @returns {Promise<Object>} Caja cerrada
 * @endpoint POST /api/barberias/:slug/admin/caja/cerrar
 */
export async function cerrarCaja(cierreData) {
    const slug = getSlugActual();
    const res = await api.post(`/barberias/${slug}/admin/caja/cerrar`, cierreData);
    return res.data;
}

/**
 * Obtener historial de cajas
 * @param {Object} filtros - Filtros opcionales
 * @returns {Promise<Object>} Historial y estadísticas
 * @endpoint GET /api/barberias/:slug/admin/caja/historial
 */
export async function obtenerHistorialCajas(filtros = {}) {
    const slug = getSlugActual();
    const queryParams = new URLSearchParams(filtros).toString();
    const url = `/barberias/${slug}/admin/caja/historial${queryParams ? `?${queryParams}` : ''}`;
    const res = await api.get(url);
    return res.data;
}

/**
 * Denominaciones chilenas para arqueo
 */
export const DENOMINACIONES = {
    billetes: [
        { valor: 20000, label: '$20.000' },
        { valor: 10000, label: '$10.000' },
        { valor: 5000, label: '$5.000' },
        { valor: 2000, label: '$2.000' },
        { valor: 1000, label: '$1.000' }
    ],
    monedas: [
        { valor: 500, label: '$500' },
        { valor: 100, label: '$100' },
        { valor: 50, label: '$50' },
        { valor: 10, label: '$10' }
    ]
};
