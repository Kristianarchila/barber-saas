const mongoose = require("mongoose");

const horarioSchema = new mongoose.Schema(
  {
    barberoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barbero",
      required: true
    },

    diaSemana: {
      type: Number,
      required: true,
      min: 0,
      max: 6 // 0 = domingo, 6 = sábado
    },

    horaInicio: {
      type: String, // "09:00"
      required: true
    },

    horaFin: {
      type: String, // "18:00"
      required: true
    },

    duracionTurno: {
      type: Number, // minutos
      default: 30
    },

    activo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Horario", horarioSchema);
