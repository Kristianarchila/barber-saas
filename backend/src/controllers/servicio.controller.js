const Servicio = require("../models/Servicio");

exports.crearServicio = async (req, res, next) => {
  try {
    const { nombre, descripcion, duracion, precio } = req.body;

    const servicio = await Servicio.create({
      nombre,
      descripcion,
      duracion,
      precio,
      barberiaId: req.user.barberiaId
    });

    res.status(201).json({
      message: "Servicio creado",
      servicio
    });

  } catch (error) {
    next(error);
  }
};


exports.obtenerServicios = async (req, res, next) => {
  try {
    const servicios = await Servicio.find({ barberiaId: req.user.barberiaId });
    res.json(servicios);
  } catch (error) {
    next(error);
  }
};

exports.editarServicio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, duracion, precio } = req.body;

    const servicio = await Servicio.findOneAndUpdate(
      { _id: id, barberiaId: req.user.barberiaId },
      { nombre, descripcion, duracion, precio },
      { new: true }
    );

    if (!servicio) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    res.json(servicio);
  } catch (error) {
    next(error);
  }
};


exports.cambiarEstadoServicio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activo } = req.body; // true o false

    const servicio = await Servicio.findOneAndUpdate(
      { _id: id, barberiaId: req.user.barberiaId },
      { activo },
      { new: true }
    );

    if (!servicio) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    res.json(servicio);
  } catch (error) {
    next(error);
  }
};



exports.eliminarServicio = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Servicio.findByIdAndDelete(id);
    res.json({ message: "Servicio eliminado" });
  } catch (error) {
    next(error);
  }
};

