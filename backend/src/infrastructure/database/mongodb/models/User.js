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

    activo: { type: Boolean, default: true },

    // Password reset
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },

    // 🔒 S-01 FIX: Track password change time to invalidate old JWTs
    passwordChangedAt: { type: Date, default: null },

    // 📊 CLIENTE: Historial de visitas (solo relevante para rol CLIENTE)
    historialVisitas: { type: Number, default: 0 },
    ultimaVisita: { type: Date, default: null },

    // 📱 Teléfono (para contacto WhatsApp)
    telefono: { type: String, default: null, trim: true },

    // 🔔 WEB PUSH: Suscripciones push por dispositivo (soporta múltiples dispositivos)
    pushSubscriptions: [{
      endpoint: { type: String, required: true },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true }
      }
    }]
  },
  { timestamps: true }
);

// Hash password antes de guardar
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // 🔒 S-01 FIX: Record when password changes so protect() can invalidate old tokens
  // Skip on first save (new user creation)
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000); // 1s buffer for token iat precision
  }
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


