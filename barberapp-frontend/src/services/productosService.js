import api from './api';

// Obtener todos los productos de la barbería
export const obtenerProductos = async (slug, filtros = {}) => {
    const params = new URLSearchParams();

    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.destacado) params.append('destacado', 'true');
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros.ordenar) params.append('ordenar', filtros.ordenar);
    if (filtros.limite) params.append('limite', filtros.limite);
    if (filtros.pagina) params.append('pagina', filtros.pagina);

    const queryString = params.toString();
    const url = `/barberias/${slug}/productos${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data;
};

// Obtener un producto específico
export const obtenerProducto = async (slug, id) => {
    const response = await api.get(`/barberias/${slug}/productos/${id}`);
    return response.data;
};

// Obtener productos destacados
export const obtenerProductosDestacados = async (slug, limite = 8) => {
    const response = await api.get(`/barberias/${slug}/productos/destacados?limite=${limite}`);
    return response.data;
};

// Obtener productos por categoría
export const obtenerProductosPorCategoria = async (slug, categoria, filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const queryString = params.toString();
    const url = `/barberias/${slug}/productos/categoria/${categoria}${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data;
};

// Crear producto (Admin)
export const crearProducto = async (slug, productoData) => {
    const response = await api.post(`/barberias/${slug}/productos`, productoData);
    return response.data;
};

// Actualizar producto (Admin)
export const actualizarProducto = async (slug, id, productoData) => {
    const response = await api.put(`/barberias/${slug}/productos/${id}`, productoData);
    return response.data;
};

// Actualizar stock (Admin)
export const actualizarStock = async (slug, id, cantidad) => {
    const response = await api.patch(`/barberias/${slug}/productos/${id}/stock`, { cantidad });
    return response.data;
};

// Eliminar producto (Admin)
export const eliminarProducto = async (slug, id) => {
    const response = await api.delete(`/barberias/${slug}/productos/${id}`);
    return response.data;
};

// Categorías disponibles
export const CATEGORIAS = [
    { value: 'pomada', label: 'Pomada' },
    { value: 'cera', label: 'Cera' },
    { value: 'aceite', label: 'Aceite' },
    { value: 'shampoo', label: 'Shampoo' },
    { value: 'acondicionador', label: 'Acondicionador' },
    { value: 'gel', label: 'Gel' },
    { value: 'spray', label: 'Spray' },
    { value: 'cuidado_barba', label: 'Cuidado de Barba' },
    { value: 'herramientas', label: 'Herramientas' },
    { value: 'otros', label: 'Otros' }
];
