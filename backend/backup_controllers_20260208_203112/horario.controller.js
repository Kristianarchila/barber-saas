const Horario = require("../models/Horario");
const Barbero = require("../models/Barbero");

// Crear horario para un barbero (solo BARBERIA_ADMIN)
exports.createHorario = async (req, res, next) => {
  try {
    const {
      barberoId,
      diaSemana,
      horaInicio,
      horaFin,
      duracionTurno
    } = req.body;

    if (
      !barberoId ||
      diaSemana === undefined ||
      !horaInicio ||
      !horaFin
    ) {
      return res.status(400).json({
        message: "Datos incompletos"
      });
    }

    // Verificar que el barbero exista
    const barbero = await Barbero.findById(barberoId);

        console.log("TOKEN barberiaId:", req.user.barberiaId);
        console.log("BARBERO barberiaId:", barbero.barberiaId.toString());

        if (barbero.barberiaId.toString() !== req.user.barberiaId.toString()) {
        return res.status(403).json({
    message: "No puedes modificar barberos de otra barbería"
         });
    }


    const horario = await Horario.create({
      barberoId,
      diaSemana,
      horaInicio,
      horaFin,
      duracionTurno
    });

    res.status(201).json({
      message: "Horario creado",
      horario
    });
  } catch (error) {
    next(error);
  }
};
// Obtener horarios por barbero
exports.getHorarios = async (req, res, next) => {
  try {
    const { barberoId } = req.params;
    const horarios = await Horario.find({ barberoId }).sort("diaSemana");
    res.json(horarios);
  } catch (error) {
    next(error);
  }
};

// Crear o actualizar horario del día
exports.saveHorario = async (req, res, next) => {
  try {
    const { barberoId } = req.params;
    const { diaSemana, horaInicio, horaFin, duracionTurno, activo } = req.body;

    let horario = await Horario.findOne({ barberoId, diaSemana });

    if (!horario) {
      horario = await Horario.create({
        barberoId,
        diaSemana,
        horaInicio,
        horaFin,
        duracionTurno,
        activo: true
      });
    } else {
      horario.horaInicio = horaInicio;
      horario.horaFin = horaFin;
      horario.duracionTurno = duracionTurno;
      horario.activo = true;
      await horario.save();
    }

    res.json({
      message: "Horario guardado",
      horario
    });

  } catch (error) {
    next(error);
  }
};




// Obtener horarios de un barbero
exports.getHorariosByBarbero = async (req, res, next) => {
  try {
    const { barberoId } = req.params;

    const horarios = await Horario.find({ barberoId })
      .sort({ diaSemana: 1 });

    res.json(horarios);
  } catch (error) {
    next(error);
  }
};

// Activar / desactivar horario
exports.toggleHorario = async (req, res, next) => {
  try {
    const { horarioId } = req.params;

    const horario = await Horario.findById(horarioId);
    if (!horario) {
      return res.status(404).json({ message: "Horario no encontrado" });
    }

    horario.activo = !horario.activo;
    await horario.save();

    res.json(horario);
  } catch (error) {
    next(error);
  }
};

