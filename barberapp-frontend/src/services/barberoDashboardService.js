import api from "./api";

// =========================================================
// GESTIÓN DE RESERVAS
// =========================================================

// Obtener reservas del día del barbero
export async function getReservasBarberoDia(barberoId, fecha) {
  const res = await api.get(
    `/reservas/barberos/${barberoId}?fecha=${fecha}`
  );
  return res.data.reservas || [];
}


// =========================================================
// PERFIL Y DATOS DEL BARBERO
// =========================================================

// Obtener perfil del barbero autenticado
export const getPerfilBarbero = async () => {
  const res = await api.get("/barberos/mi-perfil"); // ✅ Ruta correcta
  return res.data;
};

// Obtener todas las citas del barbero
export const getCitasBarbero = async () => {
  const res = await api.get("/barberos/mis-citas"); // ✅ Ruta correcta
  return res.data; // El backend ya retorna el array directamente
};

// Obtener agenda del barbero (requiere fecha)
export const getAgendaBarbero = async (fecha) => {
  const res = await api.get(`/barberos/agenda?fecha=${fecha}`); // ✅ Ruta correcta con parámetro
  return res.data; // El backend ya retorna el array directamente
};

// =========================================================
// HORARIOS
// =========================================================

// Obtener horarios del barbero
export async function getHorarios(barberoId) {
  const res = await api.get(`/horarios/barberos/${barberoId}`);
  return res.data;
}

export const completarReserva = async (id) => {
  const response = await api.patch(`/reservas/${id}/completar`);
  return response.data;
};

export const cancelarReserva = async (id) => {
  const response = await api.patch(`/reservas/${id}/cancelar`);
  return response.data;
};