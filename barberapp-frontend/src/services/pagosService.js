/**
 * @file pagosService.js
 * @description Servicio para gestión de pagos (rol: BARBERIA_ADMIN)
 * 
 * Registra pagos con métodos mixtos y obtiene resúmenes
 * 
 * 🔐 Autenticación: Requiere token JWT con rol BARBERIA_ADMIN
 * 🏢 Multi-tenant: Todas las rutas están bajo /api/barberias/:slug/admin/pagos
 * 📍 Slug: Se obtiene automáticamente de la URL
 */

import api from "./api";
import { getSlug } from "../utils/slugUtils";

/**
 * Registrar nuevo pago
 * @param {Object} pagoData - Datos del pago
 * @param {string} pagoData.reservaId - ID de la reserva
 * @param {Array} pagoData.detallesPago - Array de métodos de pago
 * @returns {Promise<Object>} Pago creado
 * @endpoint POST /api/barberias/:slug/admin/pagos
 */
export async function registrarPago(pagoData) {
    const slug = getSlug();
    const res = await api.post(`/barberias/${slug}/admin/pagos`, pagoData);
    return res.data;
}

/**
 * Obtener pagos con filtros
 * @param {Object} filtros - Filtros opcionales
 * @param {string} filtros.fechaInicio - Fecha inicio (YYYY-MM-DD)
 * @param {string} filtros.fechaFin - Fecha fin (YYYY-MM-DD)
 * @param {string} filtros.barberoId - ID del barbero
 * @param {string} filtros.metodoPago - Método de pago
 * @returns {Promise<Array>} Lista de pagos
 * @endpoint GET /api/barberias/:slug/admin/pagos
 */
export async function obtenerPagos(filtros = {}) {
    const slug = getSlug();
    const queryParams = new URLSearchParams(filtros).toString();
    const url = `/barberias/${slug}/admin/pagos${queryParams ? `?${queryParams}` : ''}`;
    const res = await api.get(url);
    return res.data;
}

/**
 * Obtener resumen de ingresos
 * @param {string} mes - Mes en formato YYYY-MM
 * @returns {Promise<Object>} Resumen de ingresos
 * @endpoint GET /api/barberias/:slug/admin/pagos/resumen
 */
export async function obtenerResumenIngresos(mes) {
    const slug = getSlug();
    const queryParams = mes ? `?mes=${mes}` : '';
    const res = await api.get(`/barberias/${slug}/admin/pagos/resumen${queryParams}`);
    return res.data;
}

/**
 * Calcular comisión según método de pago
 * @param {string} metodoPago - Método de pago
 * @param {number} monto - Monto
 * @returns {number} Comisión calculada
 */
export function calcularComision(metodoPago, monto) {
    const COMISIONES = {
        EFECTIVO: 0,
        TRANSFERENCIA: 0,
        TARJETA_DEBITO: 2.5,
        TARJETA_CREDITO: 3.5,
        MERCADO_PAGO: 4.99
    };

    const porcentaje = COMISIONES[metodoPago] || 0;
    return Math.round(monto * (porcentaje / 100));
}
