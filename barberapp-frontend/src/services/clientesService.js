import api from "./api";

export const getClientes = async () => {
    const res = await api.get("/clientes");
    return res.data;
};

export const getClienteById = async (id) => {
    const res = await api.get(`/clientes/${id}`);
    return res.data;
};
