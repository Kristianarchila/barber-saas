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

// =========================================================
// GESTIÓN DE ADMINS
// =========================================================
export async function getAdminsSuperAdmin(params = {}) {
  const res = await api.get("/superadmin/admins", { params });
  return res.data;
}

export async function actualizarSedesAdmin(id, barberiaIds) {
  const res = await api.patch(`/superadmin/admins/${id}/sedes`, { barberiaIds });
  return res.data;
}

// =========================================================
// GESTIÓN DE SUCURSALES (Multi-Location)
// =========================================================
export async function getSucursales(barberiaId) {
  const res = await api.get(`/superadmin/barberias/${barberiaId}/sucursales`);
  return res.data;
}

export async function crearSucursal(barberiaId, data) {
  const res = await api.post(`/superadmin/barberias/${barberiaId}/sucursales`, data);
  return res.data;
}

export async function actualizarSucursal(barberiaId, sucursalId, data) {
  const res = await api.put(`/superadmin/barberias/${barberiaId}/sucursales/${sucursalId}`, data);
  return res.data;
}

export async function eliminarSucursal(barberiaId, sucursalId) {
  const res = await api.delete(`/superadmin/barberias/${barberiaId}/sucursales/${sucursalId}`);
  return res.data;
}

export async function toggleMatriz(barberiaId, esMatriz) {
  const res = await api.patch(`/superadmin/barberias/${barberiaId}/matriz`, { esMatriz });
  return res.data;
}
export async function getAuditLogs(params = {}) {
  const res = await api.get("/superadmin/audit-logs", { params });
  return res.data;
}
