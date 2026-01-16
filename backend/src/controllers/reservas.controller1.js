const Reserva = require("../models/Reserva");
const Barbero = require("../models/Barbero");
const Servicio = require("../models/Servicio");
const { enviarCorreo } = require("../utils/email");

// =========================================================
// 1) CREAR RESERVA
// =========================================================
exports.crearReserva = async (req, res, next) => {
  try {
    const { barberoId } = req.params;
    const { fecha, hora, emailCliente, servicioId, clienteId } = req.body;

    console.log("=== CREAR RESERVA ===");
    console.log("barberoId:", barberoId);
    console.log("Body recibido:", JSON.stringify(req.body, null, 2));

    if (!fecha || !hora || !emailCliente || !servicioId) {
      return res.status(400).json({
        message: "Fecha, hora, emailCliente y servicioId son obligatorios"
      });
    }

    // ==== obtener servicio para calcular horaFin ====
    console.log("Buscando servicio:", servicioId);
    const servicio = await Servicio.findById(servicioId);
    if (!servicio) {
      console.log("❌ Servicio no encontrado");
      return res.status(404).json({ message: "Servicio no encontrado" });
    }
    console.log("✅ Servicio encontrado:", servicio.nombre, "- Duración:", servicio.duracion);
    const duracion = servicio.duracion;

    // ==== calcular horaFin (CORREGIDO) ====
    function sumarMinutos(horaStr, mins) {
      const [h, m] = horaStr.split(":").map(Number);
      let totalMinutos = h * 60 + m + mins;
      
      const nuevaHora = Math.floor(totalMinutos / 60) % 24;
      const nuevosMinutos = totalMinutos % 60;
      
      const hh = String(nuevaHora).padStart(2, "0");
      const mm = String(nuevosMinutos).padStart(2, "0");
      return `${hh}:${mm}`;
    }
    const horaFin = sumarMinutos(hora, duracion);

    console.log("⏰ Hora inicio:", hora);
    console.log("⏱️  Duración:", duracion);
    console.log("⏰ Hora fin calculada:", horaFin);

    // ==== obtener barberiaId desde el barbero ====
    console.log("Buscando barbero:", barberoId);
    const barbero = await Barbero.findById(barberoId);
    if (!barbero) {
      console.log("❌ Barbero no encontrado");
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    console.log("✅ Barbero encontrado:", {
      id: barbero._id,
      nombre: barbero.nombre,
      barberiaId: barbero.barberiaId,
      todasLasPropiedades: Object.keys(barbero.toObject())
    });

    // Verifica que tenga barberiaId
    if (!barbero.barberiaId) {
      console.log("❌ El barbero no tiene barberiaId asignado");
      return res.status(400).json({ 
        message: "El barbero no tiene una barbería asignada. Propiedades: " + Object.keys(barbero.toObject()).join(", ")
      });
    }

    // ==== crear reserva ====
    const datosReserva = {
      barberoId,
      clienteId: clienteId || null,
      barberiaId: barbero.barberiaId,
      fecha,
      hora,
      horaFin,
      servicioId,
      estado: "RESERVADA"
    };
    
    console.log("📝 Datos para crear reserva:", JSON.stringify(datosReserva, null, 2));

    const reserva = await Reserva.create(datosReserva);
    console.log("✅ Reserva creada exitosamente:", reserva._id);

    // ==== enviar correo ====
    try {
      await enviarCorreo(
        emailCliente,
        "Reserva confirmada",
        `
          <h1>Reserva confirmada</h1>
          <p>Tu turno ha sido registrado correctamente.</p>
          <ul>
            <li><b>Fecha:</b> ${fecha}</li>
            <li><b>Hora:</b> ${hora}</li>
            <li><b>Servicio:</b> ${servicio.nombre}</li>
          </ul>
        `
      );
      console.log("✅ Correo enviado a:", emailCliente);
    } catch (emailError) {
      console.log("⚠️ Error enviando correo (no crítico):", emailError.message);
      // No fallar la reserva si falla el email
    }

    res.status(201).json({
      message: "Reserva creada y correo enviado",
      reserva
    });

  } catch (error) {
    console.error("❌ ERROR COMPLETO en crearReserva:");
    console.error("Tipo:", error.name);
    console.error("Mensaje:", error.message);
    console.error("Stack:", error.stack);
    
    if (error.name === 'ValidationError') {
      console.error("Errores de validación:", JSON.stringify(error.errors, null, 2));
    }
    
    if (error.name === 'CastError') {
      console.error("Error de cast:", error);
    }
    
    res.status(500).json({
      message: error.message || "Error al crear la reserva",
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
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

    // permisos cliente
    if (req.user.rol === "CLIENTE" && reserva.clienteId?.toString() !== req.user.id) {
      return res.status(403).json({ message: "No puedes cancelar reservas que no son tuyas" });
    }

    // barberia
    if (req.user.rol !== "SUPER_ADMIN" && reserva.barberiaId.toString() !== req.user.barberiaId.toString()) {
      return res.status(403).json({ message: "No puedes cancelar reservas de otra barbería" });
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

    if (reserva.estado === "CANCELADA") {
      return res.status(400).json({ message: "No puedes completar una reserva cancelada" });
    }

    if (reserva.estado === "COMPLETADA") {
      return res.status(400).json({ message: "La reserva ya está completada" });
    }

    if (req.user.rol === "CLIENTE") {
      return res.status(403).json({ message: "Los clientes no pueden completar reservas" });
    }

    if (req.user.rol !== "SUPER_ADMIN" && reserva.barberiaId.toString() !== req.user.barberiaId.toString()) {
      return res.status(403).json({ message: "No puedes completar reservas de otra barbería" });
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

    // Si cliente -> solo sus reservas
    if (req.user.rol === "CLIENTE") {
      filtro.clienteId = req.user.id;
      filtro.fecha = req.query.fecha;
    }

    // Si admin y tiene barbería -> filtrar por barbería
    if (req.user.rol === "ADMIN" && req.user.barberiaId) {
      filtro.barberiaId = req.user.barberiaId;
    }
     if (req.query.fecha) {
      filtro.fecha = req.query.fecha;   // <-- ESTE ES EL FALTA
    }

    // SUPER_ADMIN ve todo = filtro vacío

    console.log("Filtro aplicado:", filtro);

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
    const { id } = req.params;

    const reserva = await Reserva.findById(id)
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
exports.listarPorBarbero = async (req, res, next) => {
  try {
    const { barberoId } = req.params;
    const { fecha } = req.query;

    let filtro = { barberoId };

    if (fecha) filtro.fecha = fecha;
    if (["ADMIN", "BARBERO"].includes(req.user.rol)) {
      filtro.barberiaId = req.user.barberiaId;
    }

    const reservas = await Reserva.find(filtro)
      .populate("clienteId", "nombre email")
      .populate("servicioId", "nombre duracion precio")
      .sort({ fecha: 1, hora: 1 });

    res.json({ total: reservas.length, reservas });

  } catch (error) {
    next(error);
  }
};

exports.listarUltimasReservas = async (req, res, next) => {
  try {
    let filtro = {};

    // ADMIN / BARBERO → solo su barbería
    if (req.user.rol !== "SUPER_ADMIN") {
      filtro.barberiaId = req.user.barberiaId;
    }

    const reservas = await Reserva.find(filtro)
      .populate("barberoId", "nombre")
      .populate("servicioId", "nombre precio")
      .sort({ createdAt: -1 }) // últimas primero
      .limit(5);               // solo 5

    res.json(reservas);

  } catch (error) {
    next(error);
  }
};