const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDeletePlugin");

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

    extras: {
      type: String,
      trim: true,
      default: "" // Ej: "+Bebestible +Masaje de relajación"
    },

    activo: {
      type: Boolean,
      default: true
    },

    imagen: {
      type: String,
      trim: true,
      default: ""
    }
  },

  { timestamps: true }
);

// Apply soft delete plugin
servicioSchema.plugin(softDeletePlugin);

module.exports = mongoose.models.Servicio || mongoose.model('Servicio', servicioSchema);


