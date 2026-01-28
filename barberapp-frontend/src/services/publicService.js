import api from "./api";

// 1. Obtener información básica de la barbería por Slug
export async function getBarberiaBySlug(slug) {
  const res = await api.get(`/public/${slug}`);
  return res.data;
}

// 2. Obtener barberos de una barbería por su Slug
export async function getBarberosBySlug(slug) {
  const res = await api.get(`/public/${slug}/barberos`);
  return res.data;
}

// 3. Obtener servicios de una barbería por su Slug
export async function getServiciosBySlug(slug) {
  const res = await api.get(`/public/${slug}/servicios`);
  return res.data;
}

// 4. Obtener disponibilidad filtrada por slug
export async function getDisponibilidadBySlug(slug, barberoId, fecha, servicioId) {
  const res = await api.get(`/public/${slug}/barberos/${barberoId}/disponibilidad`, {
    params: { fecha, servicioId }
  });
  return res.data;
}

// 5. Crear reserva bajo el tenant del slug
export async function crearReservaBySlug(slug, barberoId, datos) {
  const res = await api.post(`/public/${slug}/barberos/${barberoId}/reservar`, datos);
  return res.data;
}

// 6. Obtener info de reserva por token (para cancelar/reagendar)
export async function getReservaByToken(token) {
  const res = await api.get(`/reservas/token/${token}/data`);
  return res.data;
}

// 7. Cancelar reserva por token
export async function cancelarReservaByToken(token) {
  const res = await api.post(`/reservas/token/${token}/cancelar`);
  return res.data;
}

// 8. Confirmar reagendado por token
export async function reagendarReservaByToken(token, datos) {
  const res = await api.post(`/reservas/token/${token}/reagendar`, datos);
  return res.data;
}
