const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDeletePlugin");

const barberiaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true
    },
    slug: {
      type: String,
      required: true,

      lowercase: true,
      trim: true
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      lowercase: true,
      trim: true
    },
    telefono: {
      type: String,
      trim: true
    },
    direccion: {
      type: String,
      trim: true
    },
    rut: {
      type: String,
      trim: true
    },

    // MULTI-SEDE: Indica si es una marca con múltiples ubicaciones
    esMatriz: {
      type: Boolean,
      default: false
    },

    // Configuración visual y funcional
    configuracion: {
      colorPrincipal: { type: String, default: "#cc2b2b" },
      colorAccent: { type: String, default: "#1e3a8a" },
      colorSuccess: { type: String, default: "#059669" },
      colorWarning: { type: String, default: "#f59e0b" },
      colorLight: { type: String, default: "#f8fafc" },
      colorDark: { type: String, default: "#0a0a0b" },
      fontFamily: { type: String, default: "Inter" },
      fontHeading: { type: String, default: "Inter" },
      logoUrl: { type: String },
      bannerUrl: { type: String },
      mensajeBienvenida: { type: String },
      heroTitle: { type: String },
      badge: { type: String }, // ✅ NUEVO
      ctaPrimary: { type: String }, // ✅ NUEVO
      ctaSecondary: { type: String }, // ✅ NUEVO
      instagram: { type: String },
      facebook: { type: String },
      googleMapsUrl: { type: String },

      // ✅ NUEVOS CAMPOS DE SEO Y MARKETING
      seoTitle: { type: String },
      seoDescription: { type: String },
      faviconUrl: { type: String },
      analyticsId: { type: String }, // Google Analytics ID
      pixelId: { type: String },    // Facebook Pixel ID

      template: { type: String, default: "modern" },

      // Galería de portfolio
      galeria: [{
        type: String,
        validate: {
          validator: function (v) {
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: 'La URL de la imagen debe ser válida'
        }
      }],

      // Configuración de Email personalizada
      emailNotificaciones: { type: String },
      emailPassword: {
        encrypted: String,
        iv: String,
        authTag: String
      },
      emailProvider: { type: String, enum: ['gmail', 'outlook', 'smtp'], default: 'gmail' },
      nombreParaEmails: { type: String },

      // Configuración de Notificaciones
      notificaciones: {
        emailEnabled: { type: Boolean, default: true },
        pushEnabled: { type: Boolean, default: true },
        whatsappEnabled: { type: Boolean, default: false },
        reminderHoursBefore: { type: Number, default: 24 },
        confirmacionReserva: { type: Boolean, default: true },
        recordatorioReserva: { type: Boolean, default: true },
        cancelacionReserva: { type: Boolean, default: true }
      },

      smtpConfig: {
        host: String,
        port: Number,
        galeria: [{ type: String }]
      },

      // ✅ NUEVO: Configuración de Reseñas
      configuracionResenas: {
        habilitadas: { type: Boolean, default: true },
        moderacionAutomatica: { type: Boolean, default: false }, // false = require approval
        calificacionMinima: { type: Number, default: 1, min: 1, max: 5 },
        permitirRespuestas: { type: Boolean, default: true },
        mostrarEnWeb: { type: Boolean, default: true }
      }
    }, // ✅ CIERRE de configuracion

    // MULTI-SEDE: Array de sucursales (solo si esMatriz = true)
    sucursales: [{
      nombre: {
        type: String,
        required: function () { return this.esMatriz; }
      },
      slug: {
        type: String,
        required: function () { return this.esMatriz; },
        lowercase: true,
        trim: true
      },
      direccion: { type: String },
      telefono: { type: String },
      email: { type: String },
      ubicacion: {
        lat: { type: Number },
        lng: { type: Number },
        ciudad: { type: String },
        region: { type: String },
        pais: { type: String, default: 'Chile' }
      },
      configuracion: {
        colorPrincipal: { type: String },
        logoUrl: { type: String },
        bannerUrl: { type: String },
        mensajeBienvenida: { type: String },
        galeria: [{ type: String }],
        googleMapsUrl: { type: String }
      },
      horarios: {
        lunes: { inicio: String, fin: String, cerrado: { type: Boolean, default: false } },
        martes: { inicio: String, fin: String, cerrado: { type: Boolean, default: false } },
        miercoles: { inicio: String, fin: String, cerrado: { type: Boolean, default: false } },
        jueves: { inicio: String, fin: String, cerrado: { type: Boolean, default: false } },
        viernes: { inicio: String, fin: String, cerrado: { type: Boolean, default: false } },
        sabado: { inicio: String, fin: String, cerrado: { type: Boolean, default: false } },
        domingo: { inicio: String, fin: String, cerrado: { type: Boolean, default: true } }
      },
      activa: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now }
    }],

    // Estado de la cuenta SaaS (LEGACY - mantener por compatibilidad)
    plan: {
      type: String,
      enum: ["trial", "basico", "premium", "pro"],
      default: "trial"
    },
    estado: {
      type: String,
      enum: ["activa", "suspendida", "pendiente_pago", "trial"],
      default: "trial"
    },
    activa: {
      type: Boolean,
      default: true
    },

    fechaFinTrial: { type: Date },
    proximoPago: { type: Date },

    // Para integración con Stripe (LEGACY - mantener por compatibilidad)
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },

    // ✅ NUEVO: Sistema de suscripciones completo
    subscription: {
      plan: {
        type: String,
        enum: ['FREE', 'BASIC', 'PRO'],
        default: 'FREE'
      },
      status: {
        type: String,
        enum: ['ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING', 'INCOMPLETE'],
        default: 'TRIALING'
      },
      stripeCustomerId: { type: String },
      stripeSubscriptionId: { type: String },
      stripePriceId: { type: String },
      currentPeriodStart: { type: Date },
      currentPeriodEnd: { type: Date },
      cancelAtPeriodEnd: { type: Boolean, default: false },
      trialEndsAt: { type: Date }
    },

    // ✅ NUEVO: Seguimiento de uso mensual
    usage: {
      reservasThisMonth: { type: Number, default: 0 },
      lastResetDate: { type: Date, default: Date.now }
    },

    // ✅ NUEVO: Políticas de cancelación
    politicasCancelacion: {
      enabled: { type: Boolean, default: true },
      horasMinCancelacion: { type: Number, default: 24 },
      maxCancelacionesPorMes: { type: Number, default: 3 },
      bloquearTrasExceder: { type: Boolean, default: false },
      diasBloqueo: { type: Number, default: 30 },
      mensajeBloqueo: {
        type: String,
        default: 'Has excedido el límite de cancelaciones permitidas'
      }
    },

    // ✅ NUEVO: Estadísticas de Reseñas (Optimización de Performance)
    estadisticasResenas: {
      ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
      ratingCount: { type: Number, default: 0, min: 0 },
      distribucion: {
        5: { type: Number, default: 0, min: 0 },
        4: { type: Number, default: 0, min: 0 },
        3: { type: Number, default: 0, min: 0 },
        2: { type: Number, default: 0, min: 0 },
        1: { type: Number, default: 0, min: 0 }
      },
      lastUpdated: { type: Date, default: Date.now }
    },

    // Auditoría interna
    historial: [
      {
        fecha: { type: Date, default: Date.now },
        accion: String,
        realizadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        notas: String
      }
    ]
  },
  { timestamps: true }
);

// Índices
barberiaSchema.index({ slug: 1 }, { unique: true });
barberiaSchema.index({ activa: 1 });
barberiaSchema.index({ 'sucursales.slug': 1 });
barberiaSchema.index({ esMatriz: 1 });

// Apply soft delete plugin
barberiaSchema.plugin(softDeletePlugin);

module.exports = mongoose.models.Barberia || mongoose.model('Barberia', barberiaSchema);


