const Horario = require("../models/Horario");
const Reserva = require("../models/Reserva");
const Servicio = require("../models/Servicio");
const User = require("../models/User");
const dayjs = require("dayjs");

// ===================================================
// 1️⃣ DISPONIBILIDAD DE TURNOS
// ===================================================
exports.getDisponibilidad = async (req, res, next) => {
  try {
    const { barberoId } = req.params;
    const { fecha, servicioId } = req.query;

    if (!fecha || !servicioId) {
      return res.status(400).json({
        message: "Debe enviar fecha y servicioId"
      });
    }

    const fechaObj = dayjs(fecha);
    if (!fechaObj.isValid()) {
      return res.status(400).json({ message: "Formato de fecha inválido" });
    }

    // Servicio
    const servicio = await Servicio.findById(servicioId);
    if (!servicio) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    // Horario del día
    const diaSemana = fechaObj.day(); // 0 domingo - 6 sábado
    const horario = await Horario.findOne({
      barberoId,
      diaSemana,
      activo: true
    });

    if (!horario) {
      return res.json({
        barberoId,
        fecha,
        servicioId,
        turnosDisponibles: []
      });
    }

    const inicioMin = horaToMin(horario.horaInicio);
    const finMin = horaToMin(horario.horaFin);
    const duracionTurno = horario.duracionTurno || 30;

    // Generar turnos base
    const turnos = [];
    let actual = inicioMin;

    while (actual + servicio.duracion <= finMin) {
      turnos.push(minToHora(actual));
      actual += duracionTurno;
    }

    // Reservas existentes
    const reservas = await Reserva.find({ barberoId, fecha });

    const ocupadas = new Set();

    for (const r of reservas) {
      const inicioReserva = horaToMin(r.hora);
      const servicioReservado = await Servicio.findById(r.servicioId);
      const duracionReservada = servicioReservado?.duracion || servicio.duracion;

      for (const t of turnos) {
        const inicioTurno = horaToMin(t);
        const finTurno = inicioTurno + servicio.duracion;
        const finReserva = inicioReserva + duracionReservada;

        if (!(finTurno <= inicioReserva || inicioTurno >= finReserva)) {
          ocupadas.add(t);
        }
      }
    }

    let disponibles = turnos.filter(t => !ocupadas.has(t));

    // Quitar horas pasadas si es hoy
    if (fechaObj.isSame(dayjs(), "day")) {
      const ahora = dayjs();
      disponibles = disponibles.filter(t => {
        const [h, m] = t.split(":");
        return fechaObj.hour(h).minute(m).isAfter(ahora);
      });
    }

    res.json({
      barberoId,
      fecha,
      servicioId,
      turnosDisponibles: disponibles
    });

  } catch (error) {
    next(error);
  }
};

// ===================================================
// 2️⃣ TURNOS DEL DÍA
// ===================================================
exports.getTurnosDia = async (req, res, next) => {
  try {
    const { barberoId } = req.params;
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ message: "La fecha es obligatoria" });
    }

    const reservas = await Reserva.find({ barberoId, fecha }).sort({ hora: 1 });

    let totalMinutos = 0;
    let totalPrecio = 0;

    const turnos = [];

    for (const r of reservas) {
      const servicio = await Servicio.findById(r.servicioId);
      const cliente = await User.findById(r.clienteId);

      if (r.estado === "COMPLETADA" && servicio) {
        totalMinutos += servicio.duracion;
        totalPrecio += servicio.precio;
      }

      turnos.push({
        hora: r.hora,
        estado: r.estado,
        servicio: servicio?.nombre || null,
        duracion: servicio?.duracion || null,
        precio: servicio?.precio || null,
        cliente: cliente?.nombre || null
      });
    }

    res.json({
      fecha,
      barberoId,
      resumen: {
        totalTurnos: reservas.length,
        completados: reservas.filter(r => r.estado === "COMPLETADA").length,
        cancelados: reservas.filter(r => r.estado === "CANCELADA").length,
        reservados: reservas.filter(r => r.estado === "RESERVADA").length,
        ingresosGenerados: totalPrecio,
        horasTrabajadas: convertToHoras(totalMinutos)
      },
      turnos
    });

  } catch (error) {
    next(error);
  }
};

// ===================================================
// 3️⃣ TURNOS DEL MES
// ===================================================
exports.getTurnosMes = async (req, res, next) => {
  try {
    const { barberoId } = req.params;
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ message: "La fecha es obligatoria" });
    }

    const fechaObj = dayjs(fecha);
    const inicio = fechaObj.startOf("month").format("YYYY-MM-DD");
    const fin = fechaObj.endOf("month").format("YYYY-MM-DD");

    const reservas = await Reserva.find({
      barberoId,
      fecha: { $gte: inicio, $lte: fin }
    });

    let totalMinutos = 0;
    let totalPrecio = 0;
    const serviciosCount = {};

    for (const r of reservas) {
      const servicio = await Servicio.findById(r.servicioId);
      if (!servicio) continue;

      if (r.estado === "COMPLETADA") {
        totalMinutos += servicio.duracion;
        totalPrecio += servicio.precio;
      }

      serviciosCount[servicio.nombre] =
        (serviciosCount[servicio.nombre] || 0) + 1;
    }

    const servicioMasVendido =
      Object.entries(serviciosCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    res.json({
      barberoId,
      mes: fechaObj.format("YYYY-MM"),
      resumen: {
        totalTurnos: reservas.length,
        completados: reservas.filter(r => r.estado === "COMPLETADA").length,
        cancelados: reservas.filter(r => r.estado === "CANCELADA").length,
        reservados: reservas.filter(r => r.estado === "RESERVADA").length,
        ingresosGenerados: totalPrecio,
        horasTrabajadas: convertToHoras(totalMinutos),
        servicioMasVendido
      }
    });

  } catch (error) {
    next(error);
  }
};

// ===================================================
// 🔧 HELPERS
// ===================================================
function horaToMin(hhmm) {
  const [h, m] = hhmm.split(":");
  return parseInt(h) * 60 + parseInt(m);
}

function minToHora(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad(h)}:${pad(m)}`;
}

function pad(num) {
  return num < 10 ? "0" + num : num;
}

function convertToHoras(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
