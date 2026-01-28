import api from './api';

/**
 * Servicio para gestión de configuración de revenue split
 */

// Obtener configuración
export const getRevenueConfig = async () => {
    const slug = window.location.pathname.split('/')[1];
    const { data } = await api.get(`/barberias/${slug}/admin/revenue-config`);
    return data;
};

// Actualizar configuración general
export const updateRevenueConfig = async (config) => {
    const slug = window.location.pathname.split('/')[1];
    const { data } = await api.put(`/barberias/${slug}/admin/revenue-config`, config);
    return data;
};

// Configurar override por barbero
export const setOverrideBarbero = async (barberoId, override) => {
    const slug = window.location.pathname.split('/')[1];
    const { data } = await api.put(
        `/barberias/${slug}/admin/revenue-config/barberos/${barberoId}`,
        override
    );
    return data;
};

// Configurar override por servicio
export const setOverrideServicio = async (servicioId, override) => {
    const slug = window.location.pathname.split('/')[1];
    const { data } = await api.put(
        `/barberias/${slug}/admin/revenue-config/servicios/${servicioId}`,
        override
    );
    return data;
};

// Eliminar override
export const deleteOverride = async (tipo, id) => {
    const slug = window.location.pathname.split('/')[1];
    const { data } = await api.delete(
        `/barberias/${slug}/admin/revenue-config/overrides/${tipo}/${id}`
    );
    return data;
};

// Obtener override específico de un barbero
export const getOverrideBarbero = async (barberoId) => {
    const slug = window.location.pathname.split('/')[1];
    const { data } = await api.get(
        `/barberias/${slug}/admin/revenue-config/barberos/${barberoId}`
    );
    return data;
};
