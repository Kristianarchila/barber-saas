const Reserva = require("../models/Reserva");
const Barbero = require("../models/Barbero");
const Servicio = require("../models/Servicio");
const dayjs = require("dayjs");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const inicioMes = dayjs().startOf("month").format("YYYY-MM-DD");
    const finMes = dayjs().endOf("month").format("YYYY-MM-DD");

    const totalBarberos = await Barbero.countDocuments({
      barberiaId: req.user.barberiaId
    });

    const totalServicios = await Servicio.countDocuments({
      barberiaId: req.user.barberiaId
    });

    const turnosMes = await Reserva.countDocuments({
      barberiaId: req.user.barberiaId,
      fecha: { $gte: inicioMes, $lte: finMes }
    });

 
    const ultimasReservas = await Reserva.find({
      barberiaId: req.user.barberiaId
    })
      .populate("barberoId", "nombre")
      .populate("servicioId", "nombre precio")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalBarberos,
      totalServicios,
      turnosMes,
      ultimasReservas
    });

  } catch (error) {
    next(error);
  }
};