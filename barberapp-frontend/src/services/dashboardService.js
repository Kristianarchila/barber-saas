import api from "./api";

export async function getDashboardAdmin() {
  const res = await api.get("/dashboard");
  return res.data;
}
export async function getUltimasReservas() {
  const res = await api.get("/reservas/ultimas");
  return res.data;
}

export async function completarReserva(id) {
  const res = await api.patch(`/reservas/${id}/completar`);
  return res.data;
}

export async function cancelarReserva(id) {
  const res = await api.patch(`/reservas/${id}/cancelar`);
  return res.data;
}
