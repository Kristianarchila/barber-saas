const events = require("../events");
const emailService = require("../notifications/email/email.service");

console.log("📡 reservas.events cargado");

events.on("reserva.creada", async (reserva) => {
  try {
    await emailService.reservaConfirmada(reserva);
  } catch (error) {
    console.error("⚠️ Error enviando email:", error.message);
  }
});
