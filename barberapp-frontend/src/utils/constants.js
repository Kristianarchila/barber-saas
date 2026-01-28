export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    BARBERIA_ADMIN: "BARBERIA_ADMIN",
    BARBERO: "BARBERO",
    CLIENTE: "CLIENTE"
};

export const ESTADOS_RESERVA = {
    RESERVADA: "RESERVADA",
    CANCELADA: "CANCELADA",
    COMPLETADA: "COMPLETADA"
};
