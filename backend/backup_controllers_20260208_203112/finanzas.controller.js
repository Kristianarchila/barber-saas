const Reserva = require("../models/Reserva");

exports.getResumenFinanzas = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const { rol, barberiaId } = req.user;

    // 🔐 Seguridad clara
    if (!["BARBERIA_ADMIN", "SUPER_ADMIN"].includes(rol)) {
      return res.status(403).json({ message: "Acceso no autorizado" });
    }

    if (rol === "BARBERIA_ADMIN" && !barberiaId) {
      return res.status(400).json({ message: "Barbería no asociada" });
    }

    const hoy = new Date();
    const inicioMes = hoy.toISOString().slice(0, 7); // YYYY-MM

    const filtro = {};

    if (rol === "BARBERIA_ADMIN") {
      filtro.barberiaId = barberiaId;
    }

    const reservas = await Reserva.find(filtro)
      .populate("servicioId", "precio")
      .lean();

    let ingresosHoy = 0;
    let ingresosMes = 0;
    let completadas = 0;
    let canceladas = 0;

    reservas.forEach((r) => {
      if (!r.servicioId) return;

      const precio = r.servicioId.precio || 0;
      const fechaReserva = new Date(r.fecha);
      const fechaStr = fechaReserva.toISOString().slice(0, 10);
      const mesStr = fechaStr.slice(0, 7);

      if (r.estado === "COMPLETADA") {
        completadas++;

        if (fechaStr === hoy.toISOString().slice(0, 10)) {
          ingresosHoy += precio;
        }

        if (mesStr === inicioMes) {
          ingresosMes += precio;
        }
      }

      if (r.estado === "CANCELADA") {
        canceladas++;
      }
    });

    return res.json({
      ingresosHoy,
      ingresosMes,
      completadas,
      canceladas
    });

  } catch (error) {
    console.error("❌ Finanzas error:", error);
    return res.status(500).json({ message: "Error interno en finanzas" });
  }
};
