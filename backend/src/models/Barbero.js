const mongoose = require("mongoose");

const barberoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
      // No pongas required: true para no romper los barberos existentes
    },
    nombre: {
      type: String,
      required: true,
      trim: true
    },

    barberiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barberia",
      required: true
    },

    // 🔹 PERFIL
    foto: {
      type: String // URL de imagen
    },

    descripcion: {
      type: String,
      maxlength: 500
    },

    especialidades: {
      type: [String] // ej: ["Fade", "Barba", "Clásico"]
    },

    experiencia: {
      type: Number // años
    },

    activo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Barbero", barberoSchema);
