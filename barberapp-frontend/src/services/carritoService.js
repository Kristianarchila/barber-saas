import api from './api';

// Obtener carrito actual
export const obtenerCarrito = async (slug, sessionId = null) => {
    const headers = {};
    if (sessionId) {
        headers['X-Session-ID'] = sessionId;
    }

    const response = await api.get(`/barberias/${slug}/carrito`, { headers });
    return response.data;
};

// Agregar producto al carrito
export const agregarProducto = async (slug, productoId, cantidad, sessionId = null) => {
    const headers = {};
    if (sessionId) {
        headers['X-Session-ID'] = sessionId;
    }

    const response = await api.post(
        `/barberias/${slug}/carrito/agregar`,
        { productoId, cantidad },
        { headers }
    );
    return response.data;
};

// Actualizar cantidad de un producto
export const actualizarCantidad = async (slug, itemId, cantidad, sessionId = null) => {
    const headers = {};
    if (sessionId) {
        headers['X-Session-ID'] = sessionId;
    }

    const response = await api.put(
        `/barberias/${slug}/carrito/item/${itemId}`,
        { cantidad },
        { headers }
    );
    return response.data;
};

// Remover producto del carrito
export const removerProducto = async (slug, itemId, sessionId = null) => {
    const headers = {};
    if (sessionId) {
        headers['X-Session-ID'] = sessionId;
    }

    const response = await api.delete(`/barberias/${slug}/carrito/item/${itemId}`, { headers });
    return response.data;
};

// Vaciar carrito
export const vaciarCarrito = async (slug, sessionId = null) => {
    const headers = {};
    if (sessionId) {
        headers['X-Session-ID'] = sessionId;
    }

    const response = await api.delete(`/barberias/${slug}/carrito/vaciar`, { headers });
    return response.data;
};

// Migrar carrito de sesión a usuario
export const migrarCarrito = async (slug, sessionId) => {
    const response = await api.post(`/barberias/${slug}/carrito/migrar`, { sessionId });
    return response.data;
};

// Generar o recuperar session ID
export const getSessionId = () => {
    let sessionId = localStorage.getItem('cart_session_id');

    if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('cart_session_id', sessionId);
    }

    return sessionId;
};

// Limpiar session ID
export const clearSessionId = () => {
    localStorage.removeItem('cart_session_id');
};
