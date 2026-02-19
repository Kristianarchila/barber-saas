const mongoose = require("mongoose");

/**
 * Modelo de Caja - Control de caja diaria
 * Apertura, movimientos, cierre y arqueo físico
 */

const cajaSchema = new mongoose.Schema({
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
    turno: {
        type: String,
        enum: ['MAÑANA', 'TARDE', 'COMPLETO'],
        default: 'COMPLETO'
    },
    responsable: {
        type: String,
        required: true
    },

    // APERTURA
    horaApertura: {
        type: String,
        required: true
    },
    montoInicial: {
        type: Number,
        required: true,
        min: 0,
        default: 50000  // Fondo fijo típico
    },

    // MOVIMIENTOS - Ingresos
    ingresos: [{
        tipo: {
            type: String,
            enum: ['VENTA', 'OTRO'],
            default: 'VENTA'
        },
        monto: {
            type: Number,
            required: true,
            min: 0
        },
        concepto: {
            type: String,
            required: true
        },
        hora: String,
        reservaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reserva"
        },
        pagoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pago"
        }
    }],

    // MOVIMIENTOS - Egresos
    egresos: [{
        tipo: {
            type: String,
            enum: ['COMPRA', 'GASTO', 'RETIRO_BANCO'],
            required: true
        },
        monto: {
            type: Number,
            required: true,
            min: 0
        },
        concepto: {
            type: String,
            required: true
        },
        hora: String,
        comprobante: String,
        autorizadoPor: String
    }],

    // CIERRE
    horaCierre: String,
    montoEsperado: {
        type: Number,
        default: 0
    },
    montoReal: Number,
    diferencia: {
        type: Number,
        default: 0
    },

    // ARQUEO (conteo físico de billetes y monedas)
    arqueo: {
        billetes: {
            "20000": { type: Number, default: 0 },
            "10000": { type: Number, default: 0 },
            "5000": { type: Number, default: 0 },
            "2000": { type: Number, default: 0 },
            "1000": { type: Number, default: 0 }
        },
        monedas: {
            "500": { type: Number, default: 0 },
            "100": { type: Number, default: 0 },
            "50": { type: Number, default: 0 },
            "10": { type: Number, default: 0 }
        },
        totalContado: {
            type: Number,
            default: 0
        }
    },

    // Estado
    estado: {
        type: String,
        enum: ['ABIERTA', 'CERRADA'],
        default: 'ABIERTA',
        index: true
    },

    // Observaciones
    observaciones: String,

    // Alertas
    tieneDescuadre: {
        type: Boolean,
        default: false
    },
    nivelDescuadre: {
        type: String,
        enum: ['NINGUNO', 'MENOR', 'ALTO'],
        default: 'NINGUNO'
    }
}, {
    timestamps: true
});

// Virtual: calcular monto esperado
cajaSchema.virtual('montoEsperadoCalculado').get(function () {
    const totalIngresos = this.ingresos.reduce((sum, i) => sum + i.monto, 0);
    const totalEgresos = this.egresos.reduce((sum, e) => sum + e.monto, 0);
    return this.montoInicial + totalIngresos - totalEgresos;
});

// Middleware pre-save: calcular totales y alertas
cajaSchema.pre('save', function () {
    // Calcular monto esperado
    const totalIngresos = this.ingresos.reduce((sum, i) => sum + i.monto, 0);
    const totalEgresos = this.egresos.reduce((sum, e) => sum + e.monto, 0);
    this.montoEsperado = this.montoInicial + totalIngresos - totalEgresos;

    // Si está cerrada, calcular diferencia y alertas
    if (this.estado === 'CERRADA' && this.montoReal !== undefined) {
        this.diferencia = this.montoReal - this.montoEsperado;

        // Determinar nivel de descuadre
        const diferenciaAbs = Math.abs(this.diferencia);

        if (diferenciaAbs === 0) {
            this.tieneDescuadre = false;
            this.nivelDescuadre = 'NINGUNO';
        } else if (diferenciaAbs <= 1000) {
            this.tieneDescuadre = true;
            this.nivelDescuadre = 'MENOR';
        } else {
            this.tieneDescuadre = true;
            this.nivelDescuadre = 'ALTO';
        }
    }
});

// Índices compuestos
cajaSchema.index({ barberiaId: 1, fecha: -1 });
cajaSchema.index({ barberiaId: 1, estado: 1 });

// Método estático: obtener caja abierta
cajaSchema.statics.obtenerCajaAbierta = async function (barberiaId) {
    return this.findOne({
        barberiaId,
        estado: 'ABIERTA'
    });
};

// Método de instancia: agregar ingreso
cajaSchema.methods.agregarIngreso = function (ingreso) {
    this.ingresos.push(ingreso);
    return this.save();
};

// Método de instancia: agregar egreso
cajaSchema.methods.agregarEgreso = function (egreso) {
    this.egresos.push(egreso);
    return this.save();
};

module.exports = mongoose.models.Caja || mongoose.model('Caja', cajaSchema);


