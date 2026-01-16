const mongoose = require("mongoose");

const servicioSchema = new mongoose.Schema(
  {
    barberiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barberia",
      required: true
    },

    barberoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barbero",
      required: false 
    },

    nombre: {
      type: String,
      required: true,
      trim: true
    },

    descripcion: {
      type: String,
      trim: true
    },

    duracion: {
      type: Number, // minutos
      required: true
    },

    precio: {
      type: Number,
      required: true
    },

    activo: {
      type: Boolean,
      default: true
    }
  },

  { timestamps: true }
);

module.exports = mongoose.model("Servicio", servicioSchema);
