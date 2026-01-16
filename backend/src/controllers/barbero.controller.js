
const Barbero = require("../models/Barbero");
const User = require("../models/User"); // ⚠️ IMPORTANTE: Agregar esta líne
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

    // 1️⃣ Validaciones básicas
    if (!nombre || !email || !password) {
      return res.status(400).json({
        message: "Nombre, email y contraseña son obligatorios"
      });
    }

    // 2️⃣ Solo BARBERIA_ADMIN puede crear barberos
    if (req.user.rol !== "BARBERIA_ADMIN") {
      return res.status(403).json({
        message: "No autorizado"
      });
    }

    const barberiaId = req.user.barberiaId;

    if (!barberiaId) {
      return res.status(400).json({
        message: "No estás asociado a ninguna barbería"
      });
    }

    // 3️⃣ Verificar email único
    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({
        message: "El email ya está registrado"
      });
    }

    // 4️⃣ Crear USER (para login)
    const user = await User.create({
      nombre,
      email,
      password, // El modelo User debe hashear esto automáticamente
      rol: "BARBERO",
      barberiaId
    });

    // 5️⃣ Crear BARBERO (para agenda y perfil)
    const barbero = await Barbero.create({
      usuario: user._id, // Referencia al usuario
      nombre,
      foto: foto || '',
      descripcion: descripcion || '',
      especialidades: especialidades || [],
      experiencia: experiencia || 0,
      barberiaId,
      activo: true
    });

    res.status(201).json({
      message: "Barbero creado correctamente",
      barbero: {
        id: barbero._id,
        nombre: barbero.nombre,
        email: user.email,
        foto: barbero.foto,
        descripcion: barbero.descripcion,
        especialidades: barbero.especialidades,
        experiencia: barbero.experiencia
      }
    });

  } catch (error) {
    console.error("Error al crear barbero:", error);
    next(error);
  }
};

// =========================================================
// LISTAR BARBEROS POR BARBERÍA
// =========================================================
exports.getBarberos = async (req, res, next) => {
  try {
    const barberiaId = req.user?.barberiaId || req.query.barberiaId;

    if (!barberiaId) {
      return res.status(400).json({
        message: "Barbería no especificada"
      });
    }

    const barberos = await Barbero.find({
      barberiaId
    })
    .populate('usuario', 'nombre email') // Incluir datos del usuario
    .sort({ createdAt: 1 });

    res.json({
      total: barberos.length,
      barberos
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// OBTENER UN BARBERO POR ID
// =========================================================
exports.getBarberoById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const barbero = await Barbero.findById(id).populate('usuario', 'nombre email');
    
    if (!barbero) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    res.json(barbero);
  } catch (error) {
    next(error);
  }
};

// =========================================================
// ACTUALIZAR BARBERO
// =========================================================
exports.updateBarbero = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, foto, descripcion, especialidades, experiencia } = req.body;

    const barbero = await Barbero.findById(id);
    
    if (!barbero) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    // Verificar que pertenece a la barbería del usuario
    if (req.user.rol !== "SUPER_ADMIN" && 
        barbero.barberiaId.toString() !== req.user.barberiaId.toString()) {
      return res.status(403).json({ 
        message: "No tienes permiso para editar este barbero" 
      });
    }

    // Actualizar campos
    if (nombre !== undefined) barbero.nombre = nombre;
    if (foto !== undefined) barbero.foto = foto;
    if (descripcion !== undefined) barbero.descripcion = descripcion;
    if (especialidades !== undefined) barbero.especialidades = especialidades;
    if (experiencia !== undefined) barbero.experiencia = experiencia;

    await barbero.save();

    res.json({
      message: "Barbero actualizado exitosamente",
      barbero
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// ELIMINAR BARBERO
// =========================================================
exports.deleteBarbero = async (req, res, next) => {
  try {
    const { id } = req.params;

    const barbero = await Barbero.findById(id);
    
    if (!barbero) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    // Verificar que pertenece a la barbería del usuario
    if (req.user.rol !== "SUPER_ADMIN" && 
        barbero.barberiaId.toString() !== req.user.barberiaId.toString()) {
      return res.status(403).json({ 
        message: "No tienes permiso para eliminar este barbero" 
      });
    }

    // Eliminar también el usuario asociado
    if (barbero.usuario) {
      await User.findByIdAndDelete(barbero.usuario);
    }

    await Barbero.findByIdAndDelete(id);

    res.json({
      message: "Barbero eliminado correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// TOGGLE ESTADO ACTIVO/INACTIVO
// =========================================================
exports.toggleEstado = async (req, res, next) => {
  try {
    const { id } = req.params;

    const barbero = await Barbero.findById(id);
    
    if (!barbero) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    // Verificar que pertenece a la barbería del usuario
    if (req.user.rol !== "SUPER_ADMIN" && 
        barbero.barberiaId.toString() !== req.user.barberiaId.toString()) {
      return res.status(403).json({ 
        message: "No tienes permiso para modificar este barbero" 
      });
    }

    // Cambiar el estado
    barbero.activo = !barbero.activo;
    await barbero.save();

    // También cambiar el estado del usuario
    if (barbero.usuario) {
      await User.findByIdAndUpdate(barbero.usuario, { activo: barbero.activo });
    }

    res.json({
      message: `Barbero ${barbero.activo ? 'activado' : 'desactivado'} correctamente`,
      barbero
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// LISTAR BARBEROS PÚBLICOS (para reservas)
// =========================================================
exports.getBarberosPublicos = async (req, res, next) => {
  try {
    const { barberiaId } = req.query;

    if (!barberiaId) {
      return res.status(400).json({
        message: "Se requiere el ID de la barbería"
      });
    }

    const barberos = await Barbero.find({
      barberiaId,
      activo: true
    })
    .select('nombre foto descripcion especialidades experiencia')
    .sort({ nombre: 1 });

    res.json({
      total: barberos.length,
      barberos
    });
  } catch (error) {
    next(error);
  }
};

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

/**
 * CITAS DEL BARBERO
 */
exports.getMisCitas = async (req, res) => {
  try {
    const barbero = await Barbero.findOne({ usuario: req.user.id });

    if (!barbero) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    const citas = await Reserva.find({
      barberoId: barbero._id
    })
      .populate("clienteId", "nombre")
      .populate("servicioId", "nombre precio")
      .sort({ fecha: 1, hora: 1 });

    res.json(citas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo citas" });
  }
};


/**
 * AGENDA DEL BARBERO
 */
exports.getAgenda = async (req, res) => {
  try {
    const { fecha } = req.query;

    const barbero = await Barbero.findOne({ usuario: req.user.id });
    if (!barbero) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    const reservas = await Reserva.find({
      barberoId: barbero._id,
      fecha: fecha  // ✅ Debe filtrar por la fecha exacta
    })
      .populate("clienteId", "nombre")
      .populate("servicioId", "nombre precio")
      .sort({ hora: 1 });

    res.json(reservas);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo agenda" });
  }
};

exports.completarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const barberoId = req.user._id;

    const reserva = await Reserva.findOne({
      _id: id,
      barberoId,
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

exports.cancelarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const barberoId = req.user._id;

    const reserva = await Reserva.findOne({
      _id: id,
      barberoId,
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
