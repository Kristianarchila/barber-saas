import api from "./api";
import { getSlug } from "../utils/slugUtils";

export const getClientes = async () => {
    const slug = getSlug();
    const res = await api.get(`/barberias/${slug}/admin/clientes/admin/clientes`);
    return res.data;
};

export const getClienteById = async (id) => {
    const slug = getSlug();
    const res = await api.get(`/barberias/${slug}/admin/clientes/admin/clientes`);
    // Backend only has list endpoint — filter by ID
    const list = Array.isArray(res.data) ? res.data : res.data?.clientes || [];
    return list.find(c => c._id === id || c.id === id) || null;
};
