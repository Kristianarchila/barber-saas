const Barbero = require("../models/Barbero");
const User = require("../models/User");
const Reserva = require("../models/Reserva");

// ===================================================
// CREAR BARBERO CON USUARIO (BARBERIA_ADMIN)
// ===================================================
exports.createBarberoConUsuario = async (req, res, next) => {
  try {
    const {
      nombre,
      email,
      password,
      foto,
      descripcion,
      especialidades,
      experiencia
    } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        message: "Nombre, email y contraseña son obligatorios"
      });
    }

    if (req.user.rol !== "BARBERIA_ADMIN") {
      return res.status(403).json({ message: "No autorizado" });
    }

    const barberiaId = req.user.barberiaId;
    if (!barberiaId) {
      return res.status(400).json({ message: "No asociado a barbería" });
    }

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ message: "Email ya registrado" });
    }

    const user = await User.create({
      nombre,
      email,
      password,
      rol: "BARBERO",
      barberiaId
    });

    const barbero = await Barbero.create({
      usuario: user._id,
      nombre,
      foto: foto || "",
      descripcion: descripcion || "",
      especialidades: especialidades || [],
      experiencia: experiencia || 0,
      barberiaId,
      activo: true
    });

    res.status(201).json({
      message: "Barbero creado correctamente",
      barbero
    });
  } catch (error) {
    next(error);
  }
};

// ===================================================
// LISTAR BARBEROS (ADMIN / SUPER)
// ===================================================
exports.getBarberos = async (req, res, next) => {
  try {
    const barberiaId = req.user.barberiaId;

    const barberos = await Barbero.find({ barberiaId })
      .populate("usuario", "nombre email activo")
      .sort({ createdAt: 1 });

    res.json({
      total: barberos.length,
      barberos
    });
  } catch (error) {
    next(error);
  }
};

// ===================================================
// OBTENER BARBERO POR ID
// ===================================================
exports.getBarberoById = async (req, res, next) => {
  try {
    const barbero = await Barbero.findById(req.params.id)
      .populate("usuario", "nombre email");

    if (!barbero) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    res.json(barbero);
  } catch (error) {
    next(error);
  }
};

// ===================================================
// ACTUALIZAR BARBERO
// ===================================================
exports.updateBarbero = async (req, res, next) => {
  try {
    const barbero = await Barbero.findById(req.params.id);
    if (!barbero) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    if (
      req.user.rol !== "SUPER_ADMIN" &&
      barbero.barberiaId.toString() !== req.user.barberiaId.toString()
    ) {
      return res.status(403).json({ message: "No autorizado" });
    }

    Object.assign(barbero, req.body);
    await barbero.save();

    res.json({
      message: "Barbero actualizado",
      barbero
    });
  } catch (error) {
    next(error);
  }
};

// ===================================================
// ELIMINAR BARBERO
// ===================================================
exports.deleteBarbero = async (req, res, next) => {
  try {
    const barbero = await Barbero.findById(req.params.id);
    if (!barbero) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    if (barbero.usuario) {
      await User.findByIdAndDelete(barbero.usuario);
    }

    await barbero.deleteOne();

    res.json({ message: "Barbero eliminado" });
  } catch (error) {
    next(error);
  }
};

// ===================================================
// TOGGLE ACTIVO / INACTIVO
// ===================================================
exports.toggleEstado = async (req, res, next) => {
  try {
    const barbero = await Barbero.findById(req.params.id);
    if (!barbero) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    barbero.activo = !barbero.activo;
    await barbero.save();

    await User.findByIdAndUpdate(barbero.usuario, {
      activo: barbero.activo
    });

    res.json({
      message: `Barbero ${barbero.activo ? "activado" : "desactivado"}`
    });
  } catch (error) {
    next(error);
  }
};

// ===================================================
// BARBEROS PÚBLICOS (PARA RESERVAS)
// ===================================================
exports.getBarberosPublicos = async (req, res, next) => {
  try {
    const { barberiaId } = req.query;

    if (!barberiaId) {
      return res.status(400).json({ message: "barberiaId requerido" });
    }

    const barberos = await Barbero.find({
      barberiaId,
      activo: true
    }).select("nombre foto descripcion especialidades experiencia");

    res.json({
      total: barberos.length,
      barberos
    });
  } catch (error) {
    next(error);
  }
};

// ===================================================
// MI PERFIL (BARBERO)
// ===================================================
exports.getMiPerfil = async (req, res) => {
  const barbero = await Barbero.findOne({
    usuario: req.user.id,
    barberiaId: req.user.barberiaId
  }).populate("usuario", "nombre email");

  if (!barbero) {
    return res.status(404).json({ message: "Barbero no encontrado" });
  }

  res.json(barbero);
};

// ===================================================
// MIS CITAS (HISTORIAL)
// ===================================================
exports.getMisCitas = async (req, res) => {
  try {
    const barbero = await Barbero.findOne({
      usuario: req.user.id,
      barberiaId: req.user.barberiaId
    });

    if (!barbero) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    const citas = await Reserva.find({
      barberoId: barbero._id
    })
      .populate("clienteId", "nombre")
      .populate("servicioId", "nombre precio")
      .sort({ fecha: -1, hora: 1 });

    res.json(citas);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo citas" });
  }
};

// ===================================================
// AGENDA DEL DÍA (BARBERO)
// ===================================================
exports.getAgenda = async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({
        message: "La fecha es obligatoria"
      });
    }

    const barbero = await Barbero.findOne({
      usuario: req.user.id,
      barberiaId: req.user.barberiaId
    });

    if (!barbero) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    const reservas = await Reserva.find({
      barberoId: barbero._id,
      fecha
    })
      .populate("clienteId", "nombre")
      .populate("servicioId", "nombre precio")
      .sort({ hora: 1 });

    res.json(reservas);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo agenda" });
  }
};

// ===================================================
// COMPLETAR RESERVA
// ===================================================
exports.completarReserva = async (req, res) => {
  try {
    const barbero = await Barbero.findOne({
      usuario: req.user.id,
      barberiaId: req.user.barberiaId
    });

    const reserva = await Reserva.findOne({
      _id: req.params.id,
      barberoId: barbero._id
    });

    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    reserva.estado = "COMPLETADA";
    await reserva.save();

    res.json({ message: "Reserva completada" });
  } catch (error) {
    res.status(500).json({ message: "Error al completar reserva" });
  }
};

// ===================================================
// CANCELAR RESERVA
// ===================================================
exports.cancelarReserva = async (req, res) => {
  try {
    const barbero = await Barbero.findOne({
      usuario: req.user.id,
      barberiaId: req.user.barberiaId
    });

    const reserva = await Reserva.findOne({
      _id: req.params.id,
      barberoId: barbero._id
    });

    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    reserva.estado = "CANCELADA";
    await reserva.save();

    res.json({ message: "Reserva cancelada" });
  } catch (error) {
    res.status(500).json({ message: "Error al cancelar reserva" });
  }
};

// ===================================================
// ESTADÍSTICAS DEL BARBERO (DASHBOARD METRICS)
// ===================================================
exports.getEstadisticas = async (req, res) => {
  try {
    const barbero = await Barbero.findOne({
      usuario: req.user.id,
      barberiaId: req.user.barberiaId
    });

    if (!barbero) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());

    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    // Contadores de citas completadas
    const [citasHoy, citasSemana, citasMes, totalCitas] = await Promise.all([
      Reserva.countDocuments({
        barberoId: barbero._id,
        fecha: { $gte: hoy },
        estado: "COMPLETADA"
      }),
      Reserva.countDocuments({
        barberoId: barbero._id,
        fecha: { $gte: inicioSemana },
        estado: "COMPLETADA"
      }),
      Reserva.countDocuments({
        barberoId: barbero._id,
        fecha: { $gte: inicioMes },
        estado: "COMPLETADA"
      }),
      Reserva.countDocuments({
        barberoId: barbero._id,
        estado: "COMPLETADA"
      })
    ]);

    // Citas canceladas para calcular tasa de cancelación
    const citasCanceladasMes = await Reserva.countDocuments({
      barberoId: barbero._id,
      fecha: { $gte: inicioMes },
      estado: "CANCELADA"
    });

    const totalCitasMes = await Reserva.countDocuments({
      barberoId: barbero._id,
      fecha: { $gte: inicioMes }
    });

    const tasaCancelacion = totalCitasMes > 0
      ? ((citasCanceladasMes / totalCitasMes) * 100).toFixed(1)
      : 0;

    // Ingresos usando aggregation (suma precios de servicios)
    const ingresosData = await Reserva.aggregate([
      {
        $match: {
          barberoId: barbero._id,
          estado: "COMPLETADA"
        }
      },
      {
        $lookup: {
          from: "servicios",
          localField: "servicioId",
          foreignField: "_id",
          as: "servicio"
        }
      },
      { $unwind: "$servicio" },
      {
        $facet: {
          hoy: [
            { $match: { fecha: { $gte: hoy } } },
            { $group: { _id: null, total: { $sum: "$servicio.precio" } } }
          ],
          semana: [
            { $match: { fecha: { $gte: inicioSemana } } },
            { $group: { _id: null, total: { $sum: "$servicio.precio" } } }
          ],
          mes: [
            { $match: { fecha: { $gte: inicioMes } } },
            { $group: { _id: null, total: { $sum: "$servicio.precio" } } }
          ]
        }
      }
    ]);

    const ingresosHoy = ingresosData[0]?.hoy[0]?.total || 0;
    const ingresosSemana = ingresosData[0]?.semana[0]?.total || 0;
    const ingresosMes = ingresosData[0]?.mes[0]?.total || 0;

    // Clientes únicos del mes
    const clientesUnicos = await Reserva.distinct("nombreCliente", {
      barberoId: barbero._id,
      fecha: { $gte: inicioMes },
      estado: "COMPLETADA"
    });

    // Servicio más popular del mes
    const serviciosPopulares = await Reserva.aggregate([
      {
        $match: {
          barberoId: barbero._id,
          fecha: { $gte: inicioMes },
          estado: "COMPLETADA"
        }
      },
      {
        $lookup: {
          from: "servicios",
          localField: "servicioId",
          foreignField: "_id",
          as: "servicio"
        }
      },
      { $unwind: "$servicio" },
      {
        $group: {
          _id: "$servicio.nombre",
          cantidad: { $sum: 1 }
        }
      },
      { $sort: { cantidad: -1 } },
      { $limit: 3 }
    ]);

    res.json({
      citas: {
        hoy: citasHoy,
        semana: citasSemana,
        mes: citasMes,
        total: totalCitas
      },
      ingresos: {
        hoy: ingresosHoy,
        semana: ingresosSemana,
        mes: ingresosMes
      },
      tasaCancelacion: parseFloat(tasaCancelacion),
      clientesUnicosMes: clientesUnicos.length,
      serviciosPopulares: serviciosPopulares.map(s => ({
        nombre: s._id,
        cantidad: s.cantidad
      })),
      promedioCitasPorDia: citasMes > 0 ? (citasMes / new Date().getDate()).toFixed(1) : 0
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ message: "Error obteniendo estadísticas" });
  }
};
