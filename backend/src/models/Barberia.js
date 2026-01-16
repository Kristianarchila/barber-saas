const mongoose = require("mongoose");

const barberiaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },

    direccion: {
      type: String,
      trim: true
    },

    telefono: {
      type: String,
      trim: true
    },

    activa: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Barberia", barberiaSchema);
