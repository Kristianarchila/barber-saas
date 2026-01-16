const Reserva = require("../models/Reserva");

// ============================================
// RESUMEN FINANZAS ADMIN
// ============================================
exports.getResumenFinanzas = async (req, res, next) => {
  try {
    const { rol, barberiaId } = req.user;

    if (rol !== "ADMIN" && rol !== "SUPER_ADMIN" && rol !== "BARBERIA_ADMIN") {
      return res.status(403).json({ message: "Acceso no autorizado" });
    }

    const hoy = new Date().toISOString().slice(0, 10);
    const inicioMes = hoy.slice(0, 7); // YYYY-MM

    let filtro = {};

    if (rol === "ADMIN") {
      filtro.barberiaId = barberiaId;
    }

    const reservas = await Reserva.find(filtro).populate("servicioId", "precio");

    let ingresosHoy = 0;
    let ingresosMes = 0;
    let completadas = 0;
    let canceladas = 0;

    reservas.forEach((r) => {
      const precio = r.servicioId?.precio || 0;

      if (r.estado === "COMPLETADA") {
        completadas++;

        if (r.fecha === hoy) {
          ingresosHoy += precio;
        }

        if (r.fecha.startsWith(inicioMes)) {
          ingresosMes += precio;
        }
      }

      if (r.estado === "CANCELADA") {
        canceladas++;
      }
    });

    res.json({
      ingresosHoy,
      ingresosMes,
      completadas,
      canceladas
    });

  } catch (error) {
    next(error);
  }
};
