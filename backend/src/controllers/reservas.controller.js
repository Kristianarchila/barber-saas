const Reserva = require("../models/Reserva");
const Barbero = require("../models/Barbero");
const Servicio = require("../models/Servicio");
const reservasService = require("./reservas.service");
const emailService = require("../notifications/email/email.service");

// =========================================================
// 1) CREAR RESERVA
// =========================================================
exports.crearReserva = async (req, res) => {
  try {
    const { barberoId } = req.params;
    const {
      fecha,
      hora,
      emailCliente,
      servicioId,
      clienteId,
      nombreCliente
    } = req.body;

    // ---------------- VALIDACIONES ----------------
    if (!fecha || !hora || !emailCliente || !servicioId || !nombreCliente) {
      return res.status(400).json({
        message: "fecha, hora, emailCliente, nombreCliente y servicioId son obligatorios"
      });
    }

    // ---------------- SERVICIO ----------------
    const servicio = await Servicio.findById(servicioId);
    if (!servicio) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    // ---------------- CALCULAR HORA FIN ----------------
    const sumarMinutos = (horaStr, mins) => {
      const [h, m] = horaStr.split(":").map(Number);
      const total = h * 60 + m + mins;
      return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
    };

    const horaFin = sumarMinutos(hora, servicio.duracion);

    // ---------------- BARBERO ----------------
    const barbero = await Barbero.findById(barberoId);
    if (!barbero) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    if (!barbero.barberiaId) {
      return res.status(400).json({
        message: "El barbero no tiene barbería asignada"
      });
    }

    // ---------------- DATOS RESERVA ----------------
    const datosReserva = {
      barberoId,
      clienteId: clienteId || null,
      barberiaId: barbero.barberiaId,
      fecha,
      hora,
      horaFin,
      servicioId,
      emailCliente,
      nombreCliente,
      estado: "RESERVADA"
    };

    console.log("📝 Datos para crear reserva:", datosReserva);

    // ---------------- CREAR EN BD (OBLIGATORIO) ----------------
    const reserva = await reservasService.crearReserva(datosReserva);

    // ---------------- EMAIL (NO BLOQUEANTE) ----------------
    emailService.reservaConfirmada({
      emailCliente,
      nombreCliente,
      fecha,
      hora,
      servicio: servicio.nombre
    }).catch(err => {
      console.warn("⚠️ Error enviando email:", err.message);
    });

    // ---------------- RESPUESTA ----------------
    res.status(201).json({
      message: "Reserva creada correctamente",
      reserva
    });

  } catch (error) {
    console.error("❌ Error en crearReserva:", error);
    res.status(500).json({
      message: error.message || "Error al crear la reserva"
    });
  }
};

// =========================================================
// 2) CANCELAR RESERVA
// =========================================================
exports.cancelarReserva = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reserva = await Reserva.findById(id);
    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    if (reserva.estado === "COMPLETADA") {
      return res.status(400).json({ message: "No se puede cancelar una reserva completada" });
    }

    reserva.estado = "CANCELADA";
    await reserva.save();

    res.json({ message: "Reserva cancelada", reserva });

  } catch (error) {
    next(error);
  }
};

// =========================================================
// 3) COMPLETAR RESERVA
// =========================================================
exports.completarReserva = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reserva = await Reserva.findById(id);
    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    if (reserva.estado !== "RESERVADA") {
      return res.status(400).json({ message: "La reserva no se puede completar" });
    }

    reserva.estado = "COMPLETADA";
    await reserva.save();

    res.json({ message: "Reserva completada", reserva });

  } catch (error) {
    next(error);
  }
};

// =========================================================
// 4) LISTAR RESERVAS
// =========================================================
exports.listarReservas = async (req, res, next) => {
  try {
    let filtro = {};

    if (req.user?.rol === "CLIENTE") {
      filtro.clienteId = req.user.id;
    }

    if (req.user?.rol !== "SUPER_ADMIN") {
      filtro.barberiaId = req.user.barberiaId;
    }

    if (req.query.fecha) {
      filtro.fecha = req.query.fecha;
    }

    const reservas = await Reserva.find(filtro)
      .populate("barberoId", "nombre")
      .populate("servicioId", "nombre duracion precio")
      .sort({ fecha: 1, hora: 1 });

    res.json({ total: reservas.length, reservas });

  } catch (error) {
    next(error);
  }
};

// =========================================================
// 5) OBTENER RESERVA POR ID
// =========================================================
exports.obtenerReserva = async (req, res, next) => {
  try {
    const reserva = await Reserva.findById(req.params.id)
      .populate("barberoId", "nombre")
      .populate("clienteId", "nombre email")
      .populate("servicioId", "nombre duracion precio");

    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    res.json(reserva);

  } catch (error) {
    next(error);
  }
};

// =========================================================
// 6) LISTAR ÚLTIMAS RESERVAS
// =========================================================
exports.listarUltimasReservas = async (req, res, next) => {
  try {
    let filtro = {};

    if (req.user?.rol === "CLIENTE") {
      filtro.clienteId = req.user.id;
    }

    if (req.user?.rol !== "SUPER_ADMIN") {
      filtro.barberiaId = req.user.barberiaId;
    }

    const reservas = await Reserva.find(filtro)
      .populate("barberoId", "nombre")
      .populate("servicioId", "nombre duracion precio")
      .sort({ fecha: -1, hora: -1 })
      .limit(10); // Últimas 10 reservas

    res.json({ total: reservas.length, reservas });

  } catch (error) {
    next(error);
  }
};

// =========================================================
// 7) LISTAR RESERVAS POR BARBERO
// =========================================================
exports.listarPorBarbero = async (req, res, next) => {
  try {
    const { barberoId } = req.params;

    let filtro = { barberoId };

    // Si no es super admin, filtrar por barbería
    if (req.user?.rol !== "SUPER_ADMIN") {
      filtro.barberiaId = req.user.barberiaId;
    }

    // Filtro opcional por fecha
    if (req.query.fecha) {
      filtro.fecha = req.query.fecha;
    }

    const reservas = await Reserva.find(filtro)
      .populate("servicioId", "nombre duracion precio")
      .populate("clienteId", "nombre email")
      .sort({ fecha: 1, hora: 1 });

    res.json({ total: reservas.length, reservas });

  } catch (error) {
    next(error);
  }
};