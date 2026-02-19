import api from "./api";

/**
 * Obtiene el slug de la barbería actual desde la URL
 */
function getSlugActual() {
    return window.location.pathname.split("/")[1];
}

/**
 * Registrar una venta rápida (POS)
 * @param {Object} ventaData - Datos de la venta (items, barberoId, total, metodoPago, etc.)
 * @returns {Promise<Object>} Resultado de la venta
 */
export async function registrarVenta(ventaData) {
    const slug = getSlugActual();
    const res = await api.post(`/barberias/${slug}/admin/ventas`, ventaData);
    return res.data;
}

/**
 * Obtener historial de ventas
 * @param {Object} filtros - Filtros de búsqueda
 * @returns {Promise<Object>} Lista de ventas
 */
export async function obtenerHistorialVentas(filtros = {}) {
    const slug = getSlugActual();
    const queryParams = new URLSearchParams(filtros).toString();
    const url = `/barberias/${slug}/admin/ventas/historial${queryParams ? `?${queryParams}` : ''}`;
    const res = await api.get(url);
    return res.data;
}
