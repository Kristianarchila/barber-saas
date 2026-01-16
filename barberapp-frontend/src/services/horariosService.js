import api from "./api";

export async function getHorarios(barberoId) {
  const res = await api.get(`/horarios/barberos/${barberoId}`);
  return res.data;
}

export async function saveHorario(barberoId, body) {
  const res = await api.post(`/horarios/barberos/${barberoId}`, body);
  return res.data;
}

export async function toggleHorario(id) {
  const res = await api.patch(`/horarios/${id}/activar`);
  return res.data;
}
