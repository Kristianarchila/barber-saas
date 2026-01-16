import api from "./api";

export async function getServicios(barberiaId) {
  const res = await api.get(`/servicios?barberiaId=${barberiaId}`);
  return res.data;
}

// crear servicio

export const crearServicio = async (data) => {
  const res = await api.post("/servicios", data);
  return res.data;
};

// Editar servicio
export const editarServicio = async (id, data) => {
  const res = await api.put(`/servicios/${id}`, data);
  return res.data;
};

// Activar / Desactivar servicio
export const cambiarEstadoServicio = async (id, activo) => {
  const res = await api.patch(`/servicios/${id}/estado`, { activo });
  return res.data;
};