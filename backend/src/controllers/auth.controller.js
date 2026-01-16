// src/controllers/auth.controller.js
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res, next) => {
  try {
    const { nombre, email, password, rol, barberiaId } = req.body;

    // Validaciones mínimas
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    // Evitar duplicados
    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(409).json({ message: "Email ya registrado" });
    }

    // Crear usuario (el hash se hace en el modelo)
    const user = await User.create({
      nombre,
      email,
      password,
      rol,
      barberiaId: barberiaId || null
    });

    res.status(201).json({
      message: "Usuario creado",
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

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Validación básica
    if (!email || !password) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    // 2) Buscar usuario (OJO: +password)
    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.activo) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // 3) Comparar password
    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // 4) Generar token
    const token = generateToken(user);

    // 5) Responder (sin password)
    res.json({
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        barberiaId: user.barberiaId
      }
    });
  } catch (err) {
    next(err);
  }
};