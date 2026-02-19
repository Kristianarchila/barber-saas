import api from "./api";

/**
 * Obtiene el slug de la barbería actual desde la URL
 */
function getSlugActual() {
    return window.location.pathname.split("/")[1];
}

/**
 * Obtener todos los clientes asociados a la barbería actual
 */
export async function getClientesBarberia() {
    const slug = getSlugActual();
    const res = await api.get(`/barberias/${slug}/admin/clientes/admin/clientes`);
    return res.data;
}

/**
 * Obtener la ficha técnica de un cliente específico
 */
export async function getFichaTecnica(clienteId) {
    const slug = getSlugActual();
    const res = await api.get(`/barberias/${slug}/admin/ficha-tecnica/cliente/${clienteId}`);
    return res.data;
}

/**
 * Guardar/Actualizar notas generales del cliente
 */
export async function updateNotasGenerales(clienteId, notasGenerales) {
    const slug = getSlugActual();
    const res = await api.put(`/barberias/${slug}/admin/ficha-tecnica/cliente/${clienteId}/notas`, { notasGenerales });
    return res.data;
}

/**
 * Agregar un nuevo registro al historial técnico
 */
export async function agregarRegistroHistorial(clienteId, data) {
    const slug = getSlugActual();
    // data: { barberoId, servicioId, notaTecnica, fotos: [] }
    const res = await api.post(`/barberias/${slug}/admin/ficha-tecnica/cliente/${clienteId}/historial`, data);
    return res.data;
}

/**
 * Crear un nuevo cliente (Admin)
 */
export async function createCliente(data) {
    const slug = getSlugActual();
    const res = await api.post(`/barberias/${slug}/admin/clientes`, data);
    return res.data;
}

