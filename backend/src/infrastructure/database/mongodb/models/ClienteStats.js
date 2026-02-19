const mongoose = require('mongoose');

/**
 * @file ClienteStats.js
 * @description MongoDB schema for client statistics and cancellation tracking
 */

const clienteStatsSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email es requerido'],
        lowercase: true,
        trim: true,
        index: true
    },
    telefono: {
        type: String,
        trim: true,
        index: true
    },
    barberiaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barberia',
        required: [true, 'barberiaId es requerido'],
        index: true
    },

    // Contadores
    totalReservas: {
        type: Number,
        default: 0,
        min: 0
    },
    reservasCompletadas: {
        type: Number,
        default: 0,
        min: 0
    },
    reservasCanceladas: {
        type: Number,
        default: 0,
        min: 0
    },
    cancelacionesEsteMes: {
        type: Number,
        default: 0,
        min: 0
    },

    // Tracking
    ultimaCancelacion: {
        type: Date
    },
    ultimaReserva: {
        type: Date
    },

    // Bloqueo
    bloqueado: {
        type: Boolean,
        default: false,
        index: true
    },
    motivoBloqueo: {
        type: String,
        maxlength: 500
    },
    fechaBloqueo: {
        type: Date
    },
    fechaDesbloqueo: {
        type: Date,
        index: true
    }
}, {
    timestamps: true,
    collection: 'clientestats'
});

// Índices compuestos para queries eficientes
clienteStatsSchema.index({ email: 1, barberiaId: 1 }, { unique: true });
clienteStatsSchema.index({ barberiaId: 1, bloqueado: 1 });
clienteStatsSchema.index({ fechaDesbloqueo: 1, bloqueado: 1 });
clienteStatsSchema.index({ barberiaId: 1, cancelacionesEsteMes: -1 });

// Virtual para tasa de completitud
clienteStatsSchema.virtual('completionRate').get(function () {
    if (this.totalReservas === 0) return 0;
    return Math.round((this.reservasCompletadas / this.totalReservas) * 100);
});

// Virtual para tasa de cancelación
clienteStatsSchema.virtual('cancellationRate').get(function () {
    if (this.totalReservas === 0) return 0;
    return Math.round((this.reservasCanceladas / this.totalReservas) * 100);
});

// Método para verificar si puede reservar
clienteStatsSchema.methods.canReservar = function () {
    if (!this.bloqueado) return true;
    if (!this.fechaDesbloqueo) return false;
    return new Date() > this.fechaDesbloqueo;
};

// Método para verificar si debe desbloquearse
clienteStatsSchema.methods.shouldUnblock = function () {
    if (!this.bloqueado) return false;
    if (!this.fechaDesbloqueo) return false;
    return new Date() > this.fechaDesbloqueo;
};

// Método para incrementar reserva
clienteStatsSchema.methods.incrementReserva = function () {
    this.totalReservas++;
    this.ultimaReserva = new Date();
};

// Método para incrementar cancelación
clienteStatsSchema.methods.incrementCancelacion = function () {
    this.reservasCanceladas++;
    this.cancelacionesEsteMes++;
    this.ultimaCancelacion = new Date();
};

// Método para incrementar completada
clienteStatsSchema.methods.incrementCompletada = function () {
    this.reservasCompletadas++;
};

// Método para bloquear
clienteStatsSchema.methods.bloquear = function (motivo, diasBloqueo) {
    this.bloqueado = true;
    this.motivoBloqueo = motivo;
    this.fechaBloqueo = new Date();
    this.fechaDesbloqueo = new Date(Date.now() + diasBloqueo * 24 * 60 * 60 * 1000);
};

// Método para desbloquear
clienteStatsSchema.methods.desbloquear = function () {
    this.bloqueado = false;
    this.motivoBloqueo = null;
    this.fechaBloqueo = null;
    this.fechaDesbloqueo = null;
};

// Método para reset mensual
clienteStatsSchema.methods.resetMensual = function () {
    this.cancelacionesEsteMes = 0;
};

// Método para verificar si está cerca del límite
clienteStatsSchema.methods.isApproachingLimit = function (maxCancelaciones) {
    return this.cancelacionesEsteMes >= maxCancelaciones - 1;
};

// Método para verificar si excedió el límite
clienteStatsSchema.methods.hasExceededLimit = function (maxCancelaciones) {
    return this.cancelacionesEsteMes >= maxCancelaciones;
};

// Middleware pre-save para normalizar email
clienteStatsSchema.pre('save', function (next) {
    if (this.email) {
        this.email = this.email.toLowerCase().trim();
    }
    next();
});

// Configurar virtuals en JSON
clienteStatsSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const ClienteStats = mongoose.model('ClienteStats', clienteStatsSchema);

module.exports = ClienteStats;
