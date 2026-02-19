const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    barberiaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barberia',
        required: true
    },
    barberoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reservaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reserva',
        required: true
    },
    servicioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Servicio'
    },

    // MONTOS CALCULADOS AUTOMÁTICAMENTE
    montosAutomaticos: {
        montoTotal: {
            type: Number,
            required: true,
            min: 0
        },
        montoBarbero: {
            type: Number,
            required: true,
            min: 0
        },
        montoBarberia: {
            type: Number,
            required: true,
            min: 0
        },
        metodoCalculo: {
            type: String,
            enum: ['porcentaje', 'monto_fijo', 'custom'],
            default: 'porcentaje'
        },
        porcentajeAplicado: {
            barbero: Number,
            barberia: Number,
            origen: {
                type: String,
                enum: ['default', 'barbero', 'servicio', 'reserva'],
                default: 'default'
            }
        }
    },

    // MONTOS FINALES (pueden ser ajustados manualmente)
    montosFinales: {
        montoTotal: {
            type: Number,
            required: true,
            min: 0
        },
        montoBarbero: {
            type: Number,
            required: true,
            min: 0
        },
        montoBarberia: {
            type: Number,
            required: true,
            min: 0
        },
        fueAjustado: {
            type: Boolean,
            default: false
        },
        ajustadoPor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        fechaAjuste: Date,
        razonAjuste: String
    },

    // HISTORIAL DE AJUSTES
    historialAjustes: [{
        montoBarberoAnterior: Number,
        montoBarberoNuevo: Number,
        montoBarberíaAnterior: Number,
        montoBarberiaNuevo: Number,
        razon: String,
        ajustadoPor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        fecha: {
            type: Date,
            default: Date.now
        }
    }],

    // EXTRAS/BONIFICACIONES
    extras: {
        propina: {
            type: Number,
            default: 0,
            min: 0
        },
        bonus: {
            type: Number,
            default: 0
        },
        descuento: {
            type: Number,
            default: 0,
            min: 0
        },
        distribucionPropina: {
            type: String,
            enum: ['barbero', 'barberia', '50-50'],
            default: 'barbero'
        }
    },

    // IMPUESTOS
    impuestos: {
        iva: {
            type: Number,
            default: 0,
            min: 0
        },
        retencion: {
            type: Number,
            default: 0,
            min: 0
        },
        montoIVA: {
            type: Number,
            default: 0,
            min: 0
        },
        montoRetencion: {
            type: Number,
            default: 0,
            min: 0
        }
    },

    // ESTADO Y METADATA
    estado: {
        type: String,
        enum: ['pendiente', 'aprobado', 'pagado', 'cancelado', 'disputado'],
        default: 'pendiente'
    },
    metodoPago: {
        type: String,
        enum: ['efectivo', 'tarjeta', 'transferencia', 'otro'],
        default: 'efectivo'
    },
    notas: String,

    // APROBACIONES (si está configurado)
    aprobaciones: {
        barberoAprobo: {
            type: Boolean,
            default: false
        },
        fechaAprobacionBarbero: Date,
        adminAprobo: {
            type: Boolean,
            default: false
        },
        fechaAprobacionAdmin: Date
    },

    fecha: {
        type: Date,
        required: true,
        default: Date.now
    },
    creadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fechaPago: Date
}, {
    timestamps: true
});

// Índices para búsquedas eficientes
transactionSchema.index({ barberiaId: 1, fecha: -1 });
transactionSchema.index({ barberoId: 1, fecha: -1 });
transactionSchema.index({ reservaId: 1 });
transactionSchema.index({ estado: 1 });
transactionSchema.index({ barberiaId: 1, barberoId: 1, estado: 1 });

// Virtual para monto neto del barbero (después de impuestos)
transactionSchema.virtual('montoBarberoNeto').get(function () {
    return this.montosFinales.montoBarbero - this.impuestos.montoIVA - this.impuestos.montoRetencion;
});

// Método para calcular totales
transactionSchema.statics.calcularBalance = async function (barberoId, estado = null) {
    const match = { barberoId };
    if (estado) match.estado = estado;

    const result = await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalTransacciones: { $sum: 1 },
                totalMontoBarbero: { $sum: '$montosFinales.montoBarbero' },
                totalMontoBarberia: { $sum: '$montosFinales.montoBarberia' },
                totalImpuestos: { $sum: { $add: ['$impuestos.montoIVA', '$impuestos.montoRetencion'] } }
            }
        }
    ]);

    return result[0] || {
        totalTransacciones: 0,
        totalMontoBarbero: 0,
        totalMontoBarberia: 0,
        totalImpuestos: 0
    };
};

// Método para marcar como pagado
transactionSchema.methods.marcarComoPagado = function (adminId) {
    this.estado = 'pagado';
    this.fechaPago = new Date();
    this.aprobaciones.adminAprobo = true;
    this.aprobaciones.fechaAprobacionAdmin = new Date();
    return this.save();
};

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);


