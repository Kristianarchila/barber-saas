const { parse } = require("dotenv");
const mongoose = require("mongoose");

const reservaSchema = new mongoose.Schema(
  {
    barberoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barbero",
      required: true
    },

    clienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false // luego se activará cuando creemos clientes
    },

    nombreCliente: {
      type: String,
      required: true
    },
    barberiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barberia",
      required: true
    },
    fecha: {
      type: Date,
      required: true
    },

    cancelToken: {
      type: String
    },

    emailCliente: {  // ⬅️ AGREGAR ESTE CAMPO
      type: String,
      required: true
    },

    telefonoCliente: {  // ⬅️ NUEVO: Teléfono para contacto WhatsApp
      type: String,
      required: false,  // Opcional para no romper reservas existentes
      trim: true
    },


    reagendadaDesde: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reserva",
      default: null
    },




    hora: {
      type: String, // HH:MM
      required: true
    },

    estado: {
      type: String,
      enum: ["RESERVADA", "CANCELADA", "COMPLETADA"],
      default: "RESERVADA"
    },

    cancelToken: {
      type: String,
      required: true,
      unique: true
    },

    // Tracking de recordatorios
    reminderSent: {
      type: Boolean,
      default: false
    },
    reminderSentAt: {
      type: Date
    },

    horaFin: {
      type: String,
      required: true
    },

    servicioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Servicio",
      required: true
    },

    // 📧 CAMPOS PARA RESEÑAS
    reviewToken: {
      type: String,
      sparse: true
      // unique sparse index defined in schema.index below
    },
    reviewTokenExpiry: {
      type: Date,
      sparse: true // ✅ NUEVO: Expiración del token (30 días)
    },
    completadaEn: {
      type: Date
    },
    resenaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resena"
    },

    // 💰 CAMPOS DE PAGO (DEPÓSITO)
    depositoPagado: {
      type: Boolean,
      default: false
    },

    montoDeposito: {
      type: Number,
      default: 0
    },

    stripePaymentIntentId: {
      type: String
    },

    fechaPagoDeposito: {
      type: Date
    },

    // 💰 CAMPOS DE REVENUE SPLIT
    overridePorcentaje: {
      barbero: {
        type: Number,
        min: 0,
        max: 100
      },
      barberia: {
        type: Number,
        min: 0,
        max: 100
      },
      razon: String,
      aplicadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    },

    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction"
    },

    // 📬 CAMPOS DE NOTIFICACIONES
    notificacionEnviada: {
      type: Boolean,
      default: false
    },

    precioSnapshot: {
      precioBase: Number,
      descuento: Number,
      precioFinal: Number,
      fechaSnapshot: {
        type: Date,
        default: Date.now
      }
    }
  },
  { timestamps: true }
);

// 🚀 ÍNDICE CRÍTICO: Prevenir Overbooking con Aislamiento Multi-Tenant
// Solo permite UNA reserva por barbero/fecha/hora/barbería si el estado es RESERVADA o COMPLETADA.
// Si el estado es CANCELADA, el índice no aplica, permitiendo re-usar el horario.
// IMPORTANTE: Incluye barberiaId para aislamiento completo entre tenants
reservaSchema.index(
  { barberoId: 1, fecha: 1, hora: 1, barberiaId: 1 },
  {
    unique: true,
    partialFilterExpression: { estado: { $in: ["RESERVADA", "COMPLETADA"] } },
    name: 'unique_reservation_slot'
  }
);

// Otros índices para optimizar queries frecuentes
reservaSchema.index({ barberiaId: 1, fecha: 1 }); // Búsquedas por barbería y fecha
reservaSchema.index({ emailCliente: 1 }); // Búsqueda por email de cliente
reservaSchema.index({ cancelToken: 1 }, { unique: true, sparse: true }); // Token único para cancelación
reservaSchema.index({ reviewToken: 1 }, { unique: true, sparse: true }); // Token único para reseñas


module.exports = mongoose.models.Reserva || mongoose.model('Reserva', reservaSchema);

