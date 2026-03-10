import api from "./api";
import { getSlug } from "../utils/slugUtils";

/**
 * Registrar una venta rápida (POS)
 * @param {Object} ventaData - Datos de la venta (items, barberoId, total, metodoPago, etc.)
 * @returns {Promise<Object>} Resultado de la venta
 */
export async function registrarVenta(ventaData) {
    const slug = getSlug();
    const res = await api.post(`/barberias/${slug}/admin/ventas`, ventaData);
    return res.data;
}

/**
 * Obtener historial de ventas
 * @param {Object} filtros - Filtros de búsqueda
 * @returns {Promise<Object>} Lista de ventas
 */
export async function obtenerHistorialVentas(filtros = {}) {
    const slug = getSlug();
    const queryParams = new URLSearchParams(filtros).toString();
    const url = `/barberias/${slug}/admin/ventas/historial${queryParams ? `?${queryParams}` : ''}`;
    const res = await api.get(url);
    return res.data;
}
