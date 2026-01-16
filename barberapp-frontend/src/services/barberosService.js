import api from "./api";

export async function getBarberos() {
  const BARBERIA_ID = JSON.parse(localStorage.getItem("user")).barberiaId;
  const res = await api.get(`/barberos?barberiaId=${BARBERIA_ID}`);
  return res.data.barberos;
}

export async function crearBarbero(data) {
  const BARBERIA_ID = JSON.parse(localStorage.getItem("user")).barberiaId;
  const res = await api.post("/barberos", {
    ...data,
    barberiaId: BARBERIA_ID
  });
  return res.data;
}

export async function editarBarbero(id, data) {
  const res = await api.put(`/barberos/${id}`, data);
  return res.data;
}

export async function eliminarBarbero(id) {
  const res = await api.delete(`/barberos/${id}`);
  return res.data;
}

export async function toggleEstadoBarbero(id) {
  const res = await api.patch(`/barberos/${id}/toggle`);
  return res.data;
}

