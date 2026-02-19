import api from "./api";

const cuponesService = {
    /**
     * Obtener todos los cupones
     */
    async getCupones(slug, params = {}) {
        const response = await api.get(`/barberias/${slug}/cupones`, { params });
        return response.data;
    },

    /**
     * Crear cupón
     */
    async createCupon(slug, data) {
        const response = await api.post(`/barberias/${slug}/cupones`, data);
        return response.data;
    },

    /**
     * Actualizar cupón
     */
    async updateCupon(slug, id, data) {
        const response = await api.put(`/barberias/${slug}/cupones/${id}`, data);
        return response.data;
    },

    /**
     * Eliminar cupón
     */
    async deleteCupon(slug, id) {
        const response = await api.delete(`/barberias/${slug}/cupones/${id}`);
        return response.data;
    },

    /**
     * Validar cupón
     */
    async validarCupon(slug, codigo, montoCompra, tipoCompra = "todos", items = []) {
        const response = await api.post(`/barberias/${slug}/cupones/validar`, {
            codigo,
            montoCompra,
            tipoCompra,
            items,
        });
        return response.data;
    },

    /**
     * Obtener estadísticas de uso
     */
    async getEstadisticas(slug, id) {
        const response = await api.get(`/barberias/${slug}/cupones/${id}/estadisticas`);
        return response.data;
    },
};

export default cuponesService;
