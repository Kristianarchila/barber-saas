const  Barberia  = require("../models/Barberia");

// Crear barbería (solo SUPER_ADMIN)
exports.createBarberia = async (req, res, next) => {
  try {
    const { nombre, direccion, telefono } = req.body;

    // Validación mínima
    if (!nombre) {
      return res.status(400).json({
        message: "El nombre de la barbería es obligatorio"
      });
    }

    const barberia = await Barberia.create({
      nombre,
      direccion,
      telefono
    });

    res.status(201).json({
      message: "Barbería creada",
      barberia
    });
  } catch (error) {
    next(error);
  }
};


// Listar todas las barberías (solo SUPER_ADMIN)
exports.getBarberias = async (req, res, next) => {
  try {
    const barberias = await Barberia.find().sort({ createdAt: -1 });

    res.json({
      total: barberias.length,
      barberias
    });
  } catch (error) {
    next(error);
  }
};

