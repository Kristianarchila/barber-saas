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
      barberiaId
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
