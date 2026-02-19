const mongoose = require("mongoose");

/**
 * Modelo de Egreso - Registra gastos de la barbería
 * Categorizado, con IVA crédito fiscal y documento tributario
 */

const egresoSchema = new mongoose.Schema({
    // Relaciones
    barberiaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Barberia",
        required: true,
        index: true
    },

    // Información básica
    fecha: {
        type: String,
        required: true,
        index: true
    },
    categoria: {
        type: String,
        enum: [
            'ARRIENDO',
            'SERVICIOS_BASICOS',    // Luz, agua, internet
            'SUELDOS',
            'COMISIONES',
            'PRODUCTOS',             // Compra de insumos
            'EQUIPAMIENTO',          // Máquinas, sillas, etc.
            'MARKETING',
            'IMPUESTOS',
            'MANTENIMIENTO',
            'OTROS'
        ],
        required: true,
        index: true
    },
    descripcion: {
        type: String,
        required: true
    },

    // Montos
    monto: {
        type: Number,
        required: true,
        min: 0
    },

    // IVA
    incluyeIva: {
        type: Boolean,
        default: true
    },
    montoNeto: {
        type: Number,
        required: true
    },
    iva: {
        type: Number,
        default: 0
    },
    montoTotal: {
        type: Number,
        required: true
    },

    // Documento tributario
    tipoDocumento: {
        type: String,
        enum: ['BOLETA', 'FACTURA', 'FACTURA_ELECTRONICA', 'RECIBO', 'OTRO'],
        required: true
    },
    numeroDocumento: String,
    rutProveedor: String,
    nombreProveedor: String,

    // Recurrencia (para gastos fijos)
    esRecurrente: {
        type: Boolean,
        default: false
    },
    frecuencia: {
        type: String,
        enum: ['MENSUAL', 'TRIMESTRAL', 'ANUAL'],
        default: 'MENSUAL'
    },

    // Método de pago
    metodoPago: {
        type: String,
        enum: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE'],
        default: 'TRANSFERENCIA'
    },

    // Comprobante
    comprobante: {
        url: String,
        nombre: String
    },

    // Metadata
    registradoPor: String,
    observaciones: String,

    // Soft delete
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Middleware pre-save: calcular IVA
egresoSchema.pre('save', function () {
    if (this.incluyeIva) {
        // Si el monto incluye IVA, calcular neto e IVA
        this.montoTotal = this.monto;
        this.montoNeto = Math.round(this.monto / 1.19);
        this.iva = this.monto - this.montoNeto;
    } else {
        // Si el monto es neto, calcular IVA y total
        this.montoNeto = this.monto;
        this.iva = Math.round(this.monto * 0.19);
        this.montoTotal = this.monto + this.iva;
    }
});

// Índices compuestos
egresoSchema.index({ barberiaId: 1, fecha: -1 });
egresoSchema.index({ barberiaId: 1, categoria: 1, fecha: -1 });
egresoSchema.index({ barberiaId: 1, activo: 1 });

// Método estático: obtener resumen por categoría
egresoSchema.statics.resumenPorCategoria = async function (barberiaId, fechaInicio, fechaFin) {
    return this.aggregate([
        {
            $match: {
                barberiaId: new mongoose.Types.ObjectId(barberiaId),
                fecha: { $gte: fechaInicio, $lte: fechaFin },
                activo: true
            }
        },
        {
            $group: {
                _id: '$categoria',
                total: { $sum: '$montoTotal' },
                cantidad: { $sum: 1 }
            }
        },
        {
            $sort: { total: -1 }
        }
    ]);
};

module.exports = mongoose.models.Egreso || mongoose.model('Egreso', egresoSchema);


