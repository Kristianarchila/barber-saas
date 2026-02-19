const crypto = require("crypto");
const Reserva = require("../models/Reserva");
const Barbero = require("../models/Barbero");
const Servicio = require("../models/Servicio");
const reservasService = require("./reservas.service");
const emailService = require("../notifications/emailService");
const dayjs = require("dayjs");
const { sumarMinutos } = require("../utils/dateUtils");

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

    // Verificar si el horario ya está ocupado
    const existe = await Reserva.findOne({
      barberoId,
      fecha,
      hora,
      estado: { $in: ["RESERVADA", "COMPLETADA"] }
    });

    if (existe) {
      return res.status(400).json({
        message: "Ese horario ya está ocupado"
      });
    }

    // ---------------- CALCULAR HORA FIN ----------------
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
      estado: "RESERVADA",
      cancelToken: crypto.randomBytes(32).toString("hex")
    };

    // ---------------- CREAR EN BD ----------------
    const reserva = await reservasService.crearReserva(datosReserva);

    // ---------------- OBTENER INFO DE BARBERÍA PARA EMAIL ----------------
    const Barberia = require("../models/Barberia");
    const barberia = await Barberia.findById(barbero.barberiaId);

    const emailBarberia = barberia?.configuracion?.emailNotificaciones || barberia?.email || process.env.EMAIL_USER;
    const nombreBarberia = barberia?.configuracion?.nombreParaEmails || barberia?.nombre || "Barber Studio";

    // ---------------- URLs PARA EMAIL ----------------
    const cancelUrl = `${process.env.FRONTEND_URL}/cancelar-reserva/${reserva.cancelToken}`;
    const reagendarUrl = `${process.env.FRONTEND_URL}/reagendar/${reserva.cancelToken}`;

    // ---------------- ENVIAR EMAIL (NO BLOQUEANTE) ----------------
    try {
      await emailService.reservaConfirmada({
        emailCliente,
        nombreCliente,
        fecha,
        hora,
        servicio: servicio.nombre,
        cancelUrl,
        reagendarUrl,
        barberiaId: barbero.barberiaId
      });
    } catch (emailError) {
      console.warn("⚠️ Error enviando email de confirmación:", emailError.message);
    }

    // ---------------- RESPUESTA ----------------
    res.status(201).json({
      message: "Reserva creada correctamente",
      reserva
    });

  } catch (error) {
    // 🛡️ MANEJO DE OVERBOOKING (ERROR ATÓMICO)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Ese horario acaba de ser ocupado. Por favor elige otro."
      });
    }

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
// 3) COMPLETAR RESERVA (Atómica - Todo o Nada)
// =========================================================
exports.completarReserva = async (req, res, next) => {
  const mongoose = require("mongoose");
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const reserva = await Reserva.findById(id)
      .populate("barberoId", "nombre")
      .populate("barberiaId", "nombre slug")
      .populate("servicioId", "nombre precio")
      .session(session);

    if (!reserva) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    if (reserva.estado !== "RESERVADA") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "La reserva no se puede completar" });
    }

    // 1. Preparar Snapshot
    if (!reserva.reviewToken) reserva.reviewToken = crypto.randomBytes(32).toString("hex");
    reserva.estado = "COMPLETADA";
    reserva.completadaEn = new Date();

    if (!reserva.servicioId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "No se puede completar una reserva sin un servicio válido" });
    }

    if (!reserva.precioSnapshot) {
      reserva.precioSnapshot = {
        precioBase: reserva.servicioId.precio || 0,
        descuento: 0,
        precioFinal: reserva.servicioId.precio || 0,
        fechaSnapshot: new Date()
      };
    }

    // 2. Ejecutar Guardado
    await reserva.save({ session });

    // 3. 💰 GENERAR TRANSACCIÓN FINANCIERA
    const revenueCalculator = require('../services/revenueCalculator.service');
    // Aseguramos que pasamos los IDs correctos o el objeto si el servicio lo soporta
    await revenueCalculator.generarTransaccion(reserva, req.user._id, session);

    // 4. Confirmar todo (COMMIT)
    await session.commitTransaction();
    session.endSession();

    // 5. Emitir evento (Fuera de la transacción para no bloquear)
    try {
      const eventBus = require("../events");
      const reviewUrl = `${process.env.FRONTEND_URL}/public/${reserva.barberiaId.slug}/resena?token=${reserva.reviewToken}`;
      eventBus.emit("reserva:completada", {
        reserva,
        reviewToken: reserva.reviewToken,
        reviewUrl,
        barberia: reserva.barberiaId
      });
    } catch (e) {
      console.warn("⚠️ Evento post-reserva falló:", e.message);
    }

    res.json({ message: "Reserva completada y transacción generada", reserva });

  } catch (error) {
    // 🔙 Volver atrás si algo falla
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Error en completarReserva (Transacción abortada):", error);
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
    let filtro = { _id: req.params.id };

    if (req.user?.rol !== "SUPER_ADMIN") {
      filtro.barberiaId = req.user.barberiaId;
    }

    const reserva = await Reserva.findOne(filtro)
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
      .limit(10);

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

    if (req.user?.rol !== "SUPER_ADMIN") {
      filtro.barberiaId = req.user.barberiaId;
    }

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

// =========================================================
// 8) CANCELAR RESERVA POR TOKEN (DESDE EMAIL)
// =========================================================
exports.cancelarPorToken = async (req, res) => {
  try {
    const { token } = req.params;

    const reserva = await Reserva.findOne({ cancelToken: token });

    if (!reserva) {
      return res.status(404).json({ message: "Token inválido o expirado" });
    }

    if (reserva.estado !== "RESERVADA") {
      return res.status(400).json({ message: "La reserva no puede cancelarse" });
    }

    reserva.estado = "CANCELADA";
    await reserva.save();

    res.json({
      message: "Reserva cancelada correctamente",
      reserva
    });

  } catch (error) {
    console.error("❌ Error cancelando por token:", error);
    res.status(500).json({ message: "Error al cancelar la reserva" });
  }
};

// =========================================================
// 9) REAGENDAR RESERVA POR TOKEN
// =========================================================
exports.reagendarPorToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { fecha, hora } = req.body;

    if (!fecha || !hora) {
      return res.status(400).json({ message: "Fecha y hora son obligatorias" });
    }

    const reservaOriginal = await Reserva.findOne({ cancelToken: token })
      .populate("servicioId", "duracion");

    if (!reservaOriginal) {
      return res.status(404).json({ message: "Token inválido" });
    }

    if (reservaOriginal.estado !== "RESERVADA") {
      return res.status(400).json({ message: "La reserva no puede reagendarse" });
    }

    const horasRestantes = dayjs(`${reservaOriginal.fecha} ${reservaOriginal.hora}`)
      .diff(dayjs(), "hour");

    if (horasRestantes < 1) {
      return res.status(400).json({
        message: "No puedes reagendar con menos de 1 hora de anticipación"
      });
    }

    // Calcular nueva hora fin
    const sumarMinutos = (horaStr, mins) => {
      const [h, m] = horaStr.split(":").map(Number);
      const total = h * 60 + m + mins;
      return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
    };

    const horaFin = sumarMinutos(hora, reservaOriginal.servicioId.duracion);

    // Cancelar la original
    reservaOriginal.estado = "CANCELADA";
    await reservaOriginal.save();

    // Crear nueva reserva
    const nuevaReserva = await Reserva.create({
      barberoId: reservaOriginal.barberoId,
      barberiaId: reservaOriginal.barberiaId,
      servicioId: reservaOriginal.servicioId,
      clienteId: reservaOriginal.clienteId,
      nombreCliente: reservaOriginal.nombreCliente,
      emailCliente: reservaOriginal.emailCliente,
      fecha,
      hora,
      horaFin,
      estado: "RESERVADA",
      reagendadaDesde: reservaOriginal._id,
      cancelToken: crypto.randomBytes(32).toString("hex")
    });

    res.json({
      message: "Reserva reagendada correctamente",
      nuevaReserva
    });

  } catch (error) {
    console.error("❌ Error reagendando:", error);
    res.status(500).json({ message: "Error al reagendar" });
  }
};

// =========================================================
// 10) OBTENER DATOS PARA REAGENDAR
// =========================================================
exports.getReservaParaReagendar = async (req, res) => {
  try {
    const { token } = req.params;

    const reserva = await Reserva.findOne({
      cancelToken: token,
      estado: "RESERVADA"
    })
      .populate("servicioId", "nombre")
      .populate("barberoId", "nombre")
      .populate("barberiaId", "slug"); // <--- Populate barberiaId

    if (!reserva) {
      return res.status(404).json({
        message: "El enlace de reagendado no es válido o ya fue usado"
      });
    }

    res.json({
      message: "Datos de reserva obtenidos",
      prefill: {
        barberoId: reserva.barberoId._id,
        servicioId: reserva.servicioId._id
      },
      barberiaSlug: reserva.barberiaId.slug, // <--- Agregar esto
      servicioActual: reserva.servicioId.nombre,
      barberoActual: reserva.barberoId.nombre,
      fechaActual: reserva.fecha,
      horaActual: reserva.hora,
      nombreCliente: reserva.nombreCliente,
      emailCliente: reserva.emailCliente
    });

  } catch (error) {
    console.error("❌ Error obteniendo reserva para reagendar:", error);
    res.status(500).json({ message: "Error al obtener la reserva" });
  }
};

// =========================================================
// 11) CONFIRMAR REAGENDADO
// =========================================================
exports.confirmarReagendado = async (req, res) => {
  try {
    const { token } = req.params;
    const { fecha, hora } = req.body;

    if (!fecha || !hora) {
      return res.status(400).json({
        message: "Fecha y hora son obligatorias"
      });
    }

    const reservaOriginal = await Reserva.findOne({
      cancelToken: token,
      estado: "RESERVADA"
    }).populate("servicioId", "duracion");

    if (!reservaOriginal) {
      return res.status(404).json({
        message: "La reserva ya fue reagendada o cancelada"
      });
    }

    // Calcular horaFin
    const sumarMinutos = (horaStr, mins) => {
      const [h, m] = horaStr.split(":").map(Number);
      const total = h * 60 + m + mins;
      return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
    };

    const horaFin = sumarMinutos(hora, reservaOriginal.servicioId.duracion);

    // Verificar si el nuevo horario está disponible
    const horarioOcupado = await Reserva.findOne({
      barberoId: reservaOriginal.barberoId,
      fecha,
      hora,
      estado: { $in: ["RESERVADA", "COMPLETADA"] }
    });

    if (horarioOcupado) {
      return res.status(400).json({
        message: "El horario seleccionado ya está ocupado. Por favor elige otro horario."
      });
    }

    // Cancelar reserva original
    reservaOriginal.estado = "CANCELADA";
    reservaOriginal.cancelToken = null;
    await reservaOriginal.save();

    // Crear nueva reserva
    const nuevaReserva = await Reserva.create({
      barberoId: reservaOriginal.barberoId,
      barberiaId: reservaOriginal.barberiaId,
      servicioId: reservaOriginal.servicioId,
      clienteId: reservaOriginal.clienteId,
      nombreCliente: reservaOriginal.nombreCliente,
      emailCliente: reservaOriginal.emailCliente,
      fecha,
      hora,
      horaFin,
      estado: "RESERVADA",
      cancelToken: crypto.randomBytes(32).toString("hex"),
      reagendadaDesde: reservaOriginal._id
    });

    // Enviar email de confirmación del reagendado
    try {
      const Barberia = require("../models/Barberia");
      const Servicio = require("../models/Servicio");

      const barberia = await Barberia.findById(nuevaReserva.barberiaId);
      const servicio = await Servicio.findById(nuevaReserva.servicioId);

      const cancelUrl = `${process.env.FRONTEND_URL}/${barberia.slug}/cancelar/${nuevaReserva.cancelToken}`;
      const reagendarUrl = `${process.env.FRONTEND_URL}/${barberia.slug}/reagendar/${nuevaReserva.cancelToken}`;

      await emailService.reservaConfirmada({
        emailCliente: nuevaReserva.emailCliente,
        nombreCliente: nuevaReserva.nombreCliente,
        fecha: nuevaReserva.fecha,
        hora: nuevaReserva.hora,
        servicio: servicio.nombre,
        cancelUrl,
        reagendarUrl,
        barberiaId: nuevaReserva.barberiaId
      });

      console.log("📧 Email de confirmación de reagendado enviado");
    } catch (emailError) {
      console.warn("⚠️ Error enviando email de reagendado:", emailError.message);
    }

    res.json({
      message: "Reserva reagendada correctamente",
      nuevaReserva
    });

  } catch (error) {
    console.error("❌ Error confirmando reagendado:", error);
    res.status(500).json({ message: "Error al confirmar reagendado" });
  }
};

// =========================================================
// 12) OBTENER ID DE TOKEN
// =========================================================
exports.obtenerIdDeToken = async (req, res) => {
  try {
    const { token } = req.params;

    const reserva = await Reserva.findOne({
      cancelToken: token,
      estado: { $in: ["RESERVADA"] }
    });

    if (!reserva) {
      return res.status(404).json({
        message: "Reserva no encontrada o ya fue procesada"
      });
    }

    res.json({
      reservaId: reserva._id
    });

  } catch (error) {
    console.error("❌ Error obteniendo ID de reserva:", error);
    res.status(500).json({
      message: "Error al obtener información de la reserva"
    });
  }
};