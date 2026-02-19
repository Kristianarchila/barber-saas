import api from "./api";

const inventarioService = {
    /**
     * Obtener inventario completo
     */
    async getInventario(slug, params = {}) {
        const response = await api.get(`/barberias/${slug}/inventario`, { params });
        return response.data;
    },

    /**
     * Obtener un item de inventario
     */
    async getInventarioItem(slug, id) {
        const response = await api.get(`/barberias/${slug}/inventario/${id}`);
        return response.data;
    },

    /**
     * Crear registro de inventario para un producto
     */
    async createInventario(slug, data) {
        const response = await api.post(`/barberias/${slug}/inventario`, data);
        return response.data;
    },

    /**
     * Actualizar configuración de inventario
     */
    async updateInventario(slug, id, data) {
        const response = await api.put(`/barberias/${slug}/inventario/${id}`, data);
        return response.data;
    },

    /**
     * Registrar movimiento de stock
     */
    async registrarMovimiento(slug, inventarioId, data) {
        const response = await api.post(`/barberias/${slug}/inventario/${inventarioId}/movimiento`, data);
        return response.data;
    },

    /**
     * Obtener historial de movimientos
     */
    async getMovimientos(slug, params = {}) {
        const response = await api.get(`/barberias/${slug}/inventario/movimientos`, { params });
        return response.data;
    },

    /**
     * Obtener alertas de stock bajo
     */
    async getAlertasStock(slug) {
        const response = await api.get(`/barberias/${slug}/inventario/alertas`);
        return response.data;
    },
};

export default inventarioService;
