import api from "./api";

// =========================================================
// DASHBOARD / ESTADÍSTICAS SUPER ADMIN
// =========================================================
export async function getDashboardSuperAdmin() {
  const res = await api.get("/superadmin/stats");
  return res.data;
}

// =========================================================
// BARBERÍAS
// =========================================================
export async function getBarberias(params = {}) {
  const res = await api.get("/superadmin/barberias", { params });
  return res.data;
}

export async function getBarberia(id) {
  const res = await api.get(`/superadmin/barberias/${id}`);
  return res.data;
}

export async function crearBarberia(data) {
  const res = await api.post("/superadmin/barberias", data);
  return res.data;
}

export async function actualizarBarberia(id, data) {
  const res = await api.put(`/superadmin/barberias/${id}`, data);
  return res.data;
}

export async function eliminarBarberia(id) {
  const res = await api.delete(`/superadmin/barberias/${id}`, {
    data: { confirmar: true }
  });
  return res.data;
}

// =========================================================
// ACCIONES
// =========================================================
export async function cambiarEstadoBarberia(id, estado, notas = "") {
  const res = await api.patch(`/superadmin/barberias/${id}/estado`, {
    estado,
    notas
  });
  return res.data;
}

export async function extenderPlazoBarberia(id, dias = 30, notas = "") {
  const res = await api.patch(`/superadmin/barberias/${id}/extender`, {
    dias,
    notas
  });
  return res.data;
}

export async function getHistorialBarberia(id) {
  const res = await api.get(`/superadmin/barberias/${id}/historial`);
  return res.data;
}

export async function getFinanzasSuperAdmin() {
  const res = await api.get("/superadmin/finanzas");
  return res.data;
}
