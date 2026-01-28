import api from './api';

/**
 * Servicio para gestión de transacciones
 */

// Obtener transacciones (admin)
export const getTransactions = async (filters = {}) => {
    const slug = window.location.pathname.split('/')[1];
    const { data } = await api.get(`/barberias/${slug}/transactions/admin`, {
        params: filters
    });
    return data;
};

// Obtener detalle de transacción
export const getTransactionById = async (id) => {
    const slug = window.location.pathname.split('/')[1];
    const { data } = await api.get(`/barberias/${slug}/transactions/admin/${id}`);
    return data;
};

// Ajustar transacción manualmente
export const ajustarTransaccion = async (id, ajuste) => {
    const slug = window.location.pathname.split('/')[1];
    const { data } = await api.patch(
        `/barberias/${slug}/transactions/admin/${id}/ajustar`,
        ajuste
    );
    return data;
};

// Marcar como pagado
export const marcarComoPagado = async (id, pago) => {
    const slug = window.location.pathname.split('/')[1];
    const { data } = await api.patch(
        `/barberias/${slug}/transactions/admin/${id}/pagar`,
        pago
    );
    return data;
};

// Obtener balance de un barbero
export const getBalanceBarbero = async (barberoId) => {
    const slug = window.location.pathname.split('/')[1];
    const { data } = await api.get(
        `/barberias/${slug}/transactions/admin/barbero/${barberoId}/balance`
    );
    return data;
};

// Obtener reporte
export const getReporte = async (filters = {}) => {
    const slug = window.location.pathname.split('/')[1];
    const { data } = await api.get(`/barberias/${slug}/transactions/admin/reporte`, {
        params: filters
    });
    return data;
};

// Obtener mis transacciones (barbero)
export const getMisTransacciones = async (filters = {}) => {
    const slug = window.location.pathname.split('/')[1];
    const { data } = await api.get(`/barberias/${slug}/transactions/barbero`, {
        params: filters
    });
    return data;
};

// Obtener mi balance (barbero)
export const getMiBalance = async () => {
    const slug = window.location.pathname.split('/')[1];
    const { data } = await api.get(`/barberias/${slug}/transactions/barbero/balance`);
    return data;
};
