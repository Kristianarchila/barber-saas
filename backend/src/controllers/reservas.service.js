const Reserva = require("../models/Reserva");
const events = require("../events");

// ⚠️ OBLIGATORIO: la función debe ser async
exports.crearReserva = async (datosReserva) => {
  const reserva = await Reserva.create(datosReserva);

  // 🔥 evento central (no rompe nada)
  events.emit("reserva.creada", reserva);

  return reserva;
};
