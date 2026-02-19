const User = require("../models/User");
const Barberia = require("../models/Barberia");
const Barbero = require("../models/Barbero");

// Crear BARBERIA_ADMIN (solo SUPER_ADMIN)
exports.createBarberiaAdmin = async (req, res, next) => {
  try {
    const { nombre, email, password, barberiaId } = req.body;

    if (!nombre || !email || !password || !barberiaId) {
      return res.status(400).json({
        message: "Datos incompletos"
      });
    }

    // Verificar que la barbería exista
    const barberia = await Barberia.findById(barberiaId);
    if (!barberia) {
      return res.status(404).json({
        message: "Barbería no encontrada"
      });
    }

    const user = await User.create({
      nombre,
      email,
      password,
      rol: "BARBERIA_ADMIN",
      barberiaId,
      barberiaIds: [barberiaId]
    });

    res.status(201).json({
      message: "Administrador de barbería creado",
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        barberiaId: user.barberiaId
      }
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// CREAR USUARIO BARBERO (solo BARBERIA_ADMIN)
// =========================================================
exports.createUsuarioBarbero = async (req, res, next) => {
  try {
    const { nombre, email, password, barberoId } = req.body;

    if (!nombre || !email || !password || !barberoId) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    // Solo ADMIN puede crear barberos
    if (req.user.rol !== "BARBERIA_ADMIN") {
      return res.status(403).json({ message: "No autorizado" });
    }

    const barbero = await Barbero.findById(barberoId);
    if (!barbero) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    const user = await User.create({
      nombre,
      email,
      password,
      rol: "BARBERO",
      barberiaId: barbero.barberiaId
    });

    res.status(201).json({
      message: "Usuario barbero creado",
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (error) {
    next(error);
  }
};

// =========================================================
// OBTENER MIS BARBERÍAS (Multi-sede)
// =========================================================
exports.getMyBarberias = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("barberiaIds", "nombre slug logoUrl direccion");

    // Si no tiene barberiaIds pero tiene barberiaId (legacy), las unimos
    let barberias = user.barberiaIds || [];

    if (barberias.length === 0 && user.barberiaId) {
      const b = await Barberia.findById(user.barberiaId).select("nombre slug logoUrl direccion");
      if (b) barberias = [b];
    }

    res.json(barberias);
  } catch (error) {
    next(error);
  }
};

// =========================================================
// OBTENER CLIENTES DE LA BARBERÍA
// =========================================================
exports.obtenerClientesByBarberia = async (req, res, next) => {
  try {
    const { barberiaId } = req.user;

    // Buscamos usuarios con rol CLIENTE que pertenezcan a esta barbería
    const clientes = await User.find({
      barberiaId,
      rol: "CLIENTE"
    }).select("nombre email createdAt");

    res.json(clientes);
  } catch (error) {
    next(error);
  }
};

// =========================================================
// CREAR NUEVO CLIENTE (ADMIN)
// =========================================================
exports.createCliente = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;
    const { barberiaId } = req.user;

    // Validación básica
    if (!nombre || !email || !password) {
      return res.status(400).json({ message: "Nombre, email y contraseña son obligatorios" });
    }

    // Verificar si ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const nuevoCliente = await User.create({
      nombre,
      email,
      password,
      rol: "CLIENTE",
      barberiaId,
      barberiaIds: [barberiaId]
    });

    res.status(201).json({
      message: "Cliente creado exitosamente",
      cliente: {
        id: nuevoCliente._id,
        nombre: nuevoCliente.nombre,
        email: nuevoCliente.email,
        createdAt: nuevoCliente.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
};

