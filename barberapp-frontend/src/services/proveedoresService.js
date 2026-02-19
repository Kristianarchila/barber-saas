import api from "./api";

const proveedoresService = {
    /**
     * Obtener todos los proveedores
     */
    async getProveedores(slug, params = {}) {
        const response = await api.get(`/barberias/${slug}/proveedores`, { params });
        return response.data;
    },

    /**
     * Obtener un proveedor específico
     */
    async getProveedor(slug, id) {
        const response = await api.get(`/barberias/${slug}/proveedores/${id}`);
        return response.data;
    },

    /**
     * Crear proveedor
     */
    async createProveedor(slug, data) {
        const response = await api.post(`/barberias/${slug}/proveedores`, data);
        return response.data;
    },

    /**
     * Actualizar proveedor
     */
    async updateProveedor(slug, id, data) {
        const response = await api.put(`/barberias/${slug}/proveedores/${id}`, data);
        return response.data;
    },

    /**
     * Eliminar (desactivar) proveedor
     */
    async deleteProveedor(slug, id) {
        const response = await api.delete(`/barberias/${slug}/proveedores/${id}`);
        return response.data;
    },
};

export default proveedoresService;
