import api from "./api";


export async function crearReserva(barberoId, reservaData) {
  const res = await api.post(
    `/reservas/barberos/${barberoId}/reservar`,
    reservaData
  );
  return res.data;
}


// listar reservas del día por barbero
export async function getReservasPorBarberoDia(barberoId, fecha) {
  const res = await api.get(`/reservas/barberos/${barberoId}?fecha=${fecha}`);
  return res.data.reservas || [];
}

// completar reserva
export async function completarReserva(id) {
  const res = await api.patch(`/reservas/${id}/completar`);
  return res.data;
}

// cancelar reserva
export async function cancelarReserva(id) {
  const res = await api.patch(`/reservas/${id}/cancelar`);
  return res.data;
}

export async function getHistorialReservas(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const res = await api.get(`/reservas?${params}`);
  return res.data.reservas || [];
}