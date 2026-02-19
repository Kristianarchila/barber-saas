const mongoose = require("mongoose");

/**
 * Modelo de Pago - Registra pagos con métodos mixtos
 * Soporta efectivo, tarjeta débito/crédito, transferencia
 * Calcula comisiones bancarias e IVA automáticamente
 */

const pagoSchema = new mongoose.Schema({
    // Relaciones
    barberiaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Barberia",
        required: true,
        index: true
    },
    reservaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reserva",
        required: true
    },
    barberoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Barbero",
        required: true
    },

    // Información básica
    fecha: {
        type: String,
        required: true,
        index: true
    },
    montoTotal: {
        type: Number,
        required: true,
        min: 0
    },

    // Detalles de pago (pagos mixtos)
    detallesPago: [{
        metodoPago: {
            type: String,
            enum: ['EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'TRANSFERENCIA', 'MERCADO_PAGO'],
            required: true
        },
        monto: {
            type: Number,
            required: true,
            min: 0
        },
        comision: {
            type: Number,
            default: 0,
            min: 0
        },
        montoNeto: {
            type: Number,
            required: true,
            min: 0
        },
        // Para tarjetas
        ultimos4Digitos: String,
        codigoAutorizacion: String
    }],

    // Totales calculados por método
    totalEfectivo: {
        type: Number,
        default: 0
    },
    totalTarjeta: {
        type: Number,
        default: 0
    },
    totalTransferencia: {
        type: Number,
        default: 0
    },

    // Comisiones y neto
    comisionTotal: {
        type: Number,
        default: 0
    },
    ingresoNeto: {
        type: Number,
        required: true
    },

    // IVA (19% Chile)
    montoNeto: {
        type: Number,
        required: true
    },
    iva: {
        type: Number,
        required: true
    },
    montoConIva: {
        type: Number,
        required: true
    },

    // Documento tributario
    tipoDocumento: {
        type: String,
        enum: ['BOLETA', 'BOLETA_ELECTRONICA', 'FACTURA_ELECTRONICA'],
        default: 'BOLETA_ELECTRONICA'
    },
    numeroDocumento: String,

    // Metadata
    registradoPor: String,
    observaciones: String
}, {
    timestamps: true
});

// Middleware pre-save: calcular totales y comisiones
pagoSchema.pre('save', function () {
    // Calcular totales por método
    this.totalEfectivo = this.detallesPago
        .filter(p => p.metodoPago === 'EFECTIVO')
        .reduce((sum, p) => sum + p.monto, 0);

    this.totalTarjeta = this.detallesPago
        .filter(p => p.metodoPago.includes('TARJETA'))
        .reduce((sum, p) => sum + p.monto, 0);

    this.totalTransferencia = this.detallesPago
        .filter(p => p.metodoPago === 'TRANSFERENCIA' || p.metodoPago === 'MERCADO_PAGO')
        .reduce((sum, p) => sum + p.monto, 0);

    // Calcular comisión total
    this.comisionTotal = this.detallesPago
        .reduce((sum, p) => sum + (p.comision || 0), 0);

    // Calcular ingreso neto
    this.ingresoNeto = this.montoTotal - this.comisionTotal;

    // Calcular IVA (19% Chile)
    this.montoNeto = Math.round(this.ingresoNeto / 1.19);
    this.iva = this.ingresoNeto - this.montoNeto;
    this.montoConIva = this.ingresoNeto;
});

// Índices compuestos para queries eficientes
pagoSchema.index({ barberiaId: 1, fecha: -1 });
pagoSchema.index({ barberiaId: 1, barberoId: 1, fecha: -1 });

// Método estático: calcular comisión según método de pago
pagoSchema.statics.calcularComision = function (metodoPago, monto) {
    const COMISIONES = {
        EFECTIVO: 0,
        TRANSFERENCIA: 0,
        TARJETA_DEBITO: 2.5,      // 2.5%
        TARJETA_CREDITO: 3.5,     // 3.5%
        MERCADO_PAGO: 4.99        // 4.99%
    };

    const porcentaje = COMISIONES[metodoPago] || 0;
    return Math.round(monto * (porcentaje / 100));
};

module.exports = mongoose.models.Pago || mongoose.model('Pago', pagoSchema);


