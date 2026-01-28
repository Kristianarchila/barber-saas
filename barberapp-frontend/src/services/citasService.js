import api from "./api";

export const getCitas = async () => {
    const res = await api.get("/reservas");
    return res.data;
};

export const getCitasByBarbero = async (barberoId) => {
    const res = await api.get(`/reservas/barberos/${barberoId}`);
    return res.data;
};

export const completarCita = async (citaId) => {
    const res = await api.patch(`/reservas/${citaId}/completar`);
    return res.data;
};

export const cancelarCita = async (citaId) => {
    const res = await api.patch(`/reservas/${citaId}/cancelar`);
    return res.data;
};
