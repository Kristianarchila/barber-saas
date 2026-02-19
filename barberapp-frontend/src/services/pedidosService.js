import api from './api';

// Crear pedido
export const crearPedido = async (slug, pedidoData) => {
    const response = await api.post(`/barberias/${slug}/pedidos`, pedidoData);
    return response.data;
};

// Obtener pedido por ID
export const obtenerPedido = async (slug, id) => {
    const response = await api.get(`/barberias/${slug}/pedidos/${id}`);
    return response.data;
};

// Obtener mis pedidos (cliente)
export const obtenerMisPedidos = async (slug, filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const queryString = params.toString();
    const url = `/barberias/${slug}/pedidos/mis-pedidos${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data;
};

// Obtener todos los pedidos (Admin)
export const obtenerTodosPedidos = async (slug, filtros = {}) => {
    const params = new URLSearchParams();

    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.limite) params.append('limite', filtros.limite);
    if (filtros.pagina) params.append('pagina', filtros.pagina);

    const queryString = params.toString();
    const url = `/barberias/${slug}/pedidos${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data;
};

// Actualizar estado del pedido (Admin)
export const actualizarEstadoPedido = async (slug, id, estado) => {
    const response = await api.patch(`/barberias/${slug}/pedidos/${id}/estado`, { estado });
    return response.data;
};

// Cancelar pedido
export const cancelarPedido = async (slug, id) => {
    const response = await api.post(`/barberias/${slug}/pedidos/${id}/cancelar`);
    return response.data;
};

// Obtener estadísticas de ventas (Admin)
export const obtenerEstadisticas = async (slug, fechaInicio, fechaFin) => {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);

    const queryString = params.toString();
    const url = `/barberias/${slug}/pedidos/estadisticas/ventas${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data;
};

// Estados de pedido
export const ESTADOS_PEDIDO = [
    { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
    { value: 'confirmado', label: 'Confirmado', color: 'blue' },
    { value: 'preparando', label: 'Preparando', color: 'purple' },
    { value: 'listo', label: 'Listo', color: 'green' },
    { value: 'enviado', label: 'Enviado', color: 'indigo' },
    { value: 'entregado', label: 'Entregado', color: 'green' },
    { value: 'cancelado', label: 'Cancelado', color: 'red' }
];

// Métodos de pago
export const METODOS_PAGO = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'stripe', label: 'Stripe' }
];
