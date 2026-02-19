const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ROLES = ["SUPER_ADMIN", "BARBERIA_ADMIN", "BARBERO", "CLIENTE"];

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },

    rol: { type: String, enum: ROLES, required: true },

    // Multi-tenant: null para SUPER_ADMIN y usuarios PENDIENTE
    barberiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barberia",
      default: null,
      required: function () {
        // No requerido si:
        // - Es SUPER_ADMIN
        // - Está PENDIENTE (aún no aprobado)
        if (this.rol === "SUPER_ADMIN") return false;
        if (this.estadoCuenta === "PENDIENTE") return false;

        // Requerido para BARBERIA_ADMIN y BARBERO con cuenta ACTIVA
        return this.rol === "BARBERIA_ADMIN" || this.rol === "BARBERO";
      }
    },

    // 🏢 SOPORTE MULTI-SEDE: Lista de barberías a las que tiene acceso
    barberiaIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barberia"
    }],

    barberoId: { type: mongoose.Schema.Types.ObjectId, ref: "Barbero", default: null },

    // 🔐 ESTADO DE CUENTA (para aprobación de registro)
    estadoCuenta: {
      type: String,
      enum: ["PENDIENTE", "ACTIVA", "RECHAZADA", "SUSPENDIDA"],
      default: "ACTIVA" // Por defecto ACTIVA para usuarios creados por admin
    },
    fechaAprobacion: { type: Date, default: null },
    aprobadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    activo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Hash password antes de guardar
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Índices para optimizar queries frecuentes
userSchema.index({ email: 1 }, { unique: true }); // Email único
userSchema.index({ barberiaId: 1, rol: 1 }); // Usuarios por barbería y rol
userSchema.index({ barberoId: 1 }); // Búsqueda por barbero

// 🔒 SECURITY & PERFORMANCE: Índices para multi-tenant y aprobaciones
userSchema.index({ estadoCuenta: 1 }); // Filtrar por estado de cuenta
userSchema.index({ barberiaId: 1, estadoCuenta: 1 }); // Compound index para tenant + estado
userSchema.index({ createdAt: -1 }); // Ordenar por fecha de creación


userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;


