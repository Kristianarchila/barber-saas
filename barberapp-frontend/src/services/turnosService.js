import api from "./api";

/**
 * Obtener disponibilidad por barbero + fecha + servicio
 * Retorna el OBJETO COMPLETO del backend, NO solo el array.
 */
export async function getDisponibilidad(barberoId, fecha, servicioId) {
  if (!barberoId || !fecha || !servicioId) {
    console.warn("⚠️ Parámetros incompletos en getDisponibilidad");
    return { turnosDisponibles: [] };
  }

  const res = await api.get(
    `/turnos/barberos/${barberoId}/disponibilidad?fecha=${fecha}&servicioId=${servicioId}`
  );

  return res.data; // Mantener estructura completa
}

/**
 * Crear una reserva
 * reservaData debe tener: { fecha, hora, emailCliente, servicioId }
 */


/**
 * Turnos del día para métricas o lista diaria
 */
export async function getTurnosDia(barberoId, fecha) {
  if (!barberoId || !fecha) {
    console.warn("⚠️ Parámetros incompletos en getTurnosDia");
    return { resumen: {}, turnos: [] };
  }

  const res = await api.get(`/turnos/barberos/${barberoId}/dia?fecha=${fecha}`);
  return res.data;
}

/**
 * Turnos del mes para dashboard
 */
export async function getTurnosMes(barberoId, fecha) {
  if (!barberoId || !fecha) {
    console.warn("⚠️ Parámetros incompletos en getTurnosMes");
    return { resumen: { totalTurnos: 0 } };
  }

  const res = await api.get(`/turnos/barberos/${barberoId}/mes?fecha=${fecha}`);
  return res.data;
}
export async function completarReserva(id) {
  return api.patch(`/reservas/${id}/completar`);
}

export async function cancelarReserva(id) {
  return api.patch(`/reservas/${id}/cancelar`);
}
