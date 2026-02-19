const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDeletePlugin");

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

    // 🔹 SUCURSAL (Multi-Sede)
    sucursalId: {
      type: mongoose.Schema.Types.ObjectId,
      // No es required para mantener compatibilidad con barberías sin multi-sede
      // Si la barbería NO es multi-sede, este campo queda vacío
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

// Apply soft delete plugin
barberoSchema.plugin(softDeletePlugin);

module.exports = mongoose.models.Barbero || mongoose.model('Barbero', barberoSchema);


