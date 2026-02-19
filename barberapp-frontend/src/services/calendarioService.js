/**
 * @file calendarioService.js
 * @description Servicio para gestión de calendario (vistas semanal/mensual)
 * 
 * Funciones para obtener reservas por rangos de fechas
 * 
 * 🔐 Autenticación: Requiere token JWT
 * 🏢 Multi-tenant: Todas las rutas están bajo /api/barberias/:slug/admin/reservas
 * 📍 Slug: Se obtiene automáticamente de la URL
 */

import api from "./api";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns";

/**
 * Obtiene el slug de la barbería actual desde la URL del navegador
 * @returns {string} slug de la barbería
 */
function getSlugActual() {
    return window.location.pathname.split("/")[1];
}

/**
 * Obtiene reservas para un rango de fechas
 * @param {string} fechaInicio - Fecha inicio en formato YYYY-MM-DD
 * @param {string} fechaFin - Fecha fin en formato YYYY-MM-DD
 * @param {string|null} barberoId - ID del barbero (opcional)
 * @returns {Promise<Object>} Objeto con reservas y metadata
 * @endpoint GET /api/barberias/:slug/admin/reservas/calendario
 */
export async function getCalendario(fechaInicio, fechaFin, barberoId = null) {
    const slug = getSlugActual();

    const params = new URLSearchParams({
        fechaInicio,
        fechaFin
    });

    if (barberoId) {
        params.append('barberoId', barberoId);
    }

    const res = await api.get(`/barberias/${slug}/admin/reservas/calendario?${params.toString()}`);
    return res.data;
}

/**
 * Obtiene reservas para una semana específica
 * @param {Date} fecha - Cualquier fecha dentro de la semana deseada
 * @param {string|null} barberoId - ID del barbero (opcional)
 * @returns {Promise<Object>} Objeto con reservas de la semana
 */
export async function getWeekReservations(fecha, barberoId = null) {
    const weekStart = startOfWeek(fecha, { weekStartsOn: 1 }); // Lunes
    const weekEnd = endOfWeek(fecha, { weekStartsOn: 1 }); // Domingo

    const fechaInicio = format(weekStart, 'yyyy-MM-dd');
    const fechaFin = format(weekEnd, 'yyyy-MM-dd');

    return getCalendario(fechaInicio, fechaFin, barberoId);
}

/**
 * Obtiene reservas para un mes específico
 * @param {number} month - Mes (0-11, donde 0 = enero)
 * @param {number} year - Año (ej: 2026)
 * @param {string|null} barberoId - ID del barbero (opcional)
 * @returns {Promise<Object>} Objeto con reservas del mes
 */
export async function getMonthReservations(month, year, barberoId = null) {
    const date = new Date(year, month, 1);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const fechaInicio = format(monthStart, 'yyyy-MM-dd');
    const fechaFin = format(monthEnd, 'yyyy-MM-dd');

    return getCalendario(fechaInicio, fechaFin, barberoId);
}

/**
 * Obtiene reservas para un día específico
 * @param {Date} fecha - Fecha del día
 * @param {string|null} barberoId - ID del barbero (opcional)
 * @returns {Promise<Object>} Objeto con reservas del día
 */
export async function getDayReservations(fecha, barberoId = null) {
    const fechaStr = format(fecha, 'yyyy-MM-dd');
    return getCalendario(fechaStr, fechaStr, barberoId);
}

/**
 * Formatea una reserva para el calendario
 * @param {Object} reserva - Objeto de reserva
 * @returns {Object} Reserva formateada para calendario
 */
export function formatReservaForCalendar(reserva) {
    return {
        id: reserva._id || reserva.id,
        title: `${reserva.nombreCliente || 'Cliente'} - ${reserva.servicio?.nombre || 'Servicio'}`,
        start: new Date(`${reserva.fecha}T${reserva.timeSlot?.hora || '00:00'}:00`),
        end: new Date(`${reserva.fecha}T${reserva.timeSlot?.hora || '00:00'}:00`), // Ajustar con duración
        resource: {
            ...reserva,
            backgroundColor: getColorByStatus(reserva.estado),
            borderColor: getColorByStatus(reserva.estado, true)
        }
    };
}

/**
 * Obtiene el color según el estado de la reserva
 * @param {string} estado - Estado de la reserva
 * @param {boolean} border - Si es para el borde (más oscuro)
 * @returns {string} Color en formato hex
 */
function getColorByStatus(estado, border = false) {
    const colors = {
        RESERVADA: { bg: '#3b82f6', border: '#2563eb' }, // Blue
        CONFIRMADA: { bg: '#22c55e', border: '#16a34a' }, // Green
        COMPLETADA: { bg: '#6b7280', border: '#4b5563' }, // Gray
        CANCELADA: { bg: '#ef4444', border: '#dc2626' }, // Red
        NO_ASISTIO: { bg: '#f97316', border: '#ea580c' } // Orange
    };

    const colorSet = colors[estado] || colors.RESERVADA;
    return border ? colorSet.border : colorSet.bg;
}
