const mongoose = require('mongoose');

const revenueConfigSchema = new mongoose.Schema({
    barberiaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barberia',
        required: true,
        unique: true
    },

    // CONFIGURACIÓN GENERAL
    configuracionGeneral: {
        metodoPorcentaje: {
            type: String,
            enum: ['porcentaje', 'monto_fijo', 'mixto'],
            default: 'porcentaje'
        },

        // Porcentajes por defecto
        porcentajeDefaultBarbero: {
            type: Number,
            min: 0,
            max: 100,
            default: 50
        },
        porcentajeDefaultBarberia: {
            type: Number,
            min: 0,
            max: 100,
            default: 50
        },

        // Montos fijos (opcional)
        montoFijoBarbero: {
            type: Number,
            default: 0
        },
        montoFijoBarberia: {
            type: Number,
            default: 0
        },

        // Permisos
        permitirAjusteManual: {
            type: Boolean,
            default: true
        },
        requiereAprobacion: {
            type: Boolean,
            default: false
        }
    },

    // OVERRIDES POR BARBERO
    overridesPorBarbero: [{
        barberoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        metodo: {
            type: String,
            enum: ['porcentaje', 'monto_fijo', 'custom'],
            default: 'porcentaje'
        },
        porcentajeBarbero: {
            type: Number,
            min: 0,
            max: 100
        },
        porcentajeBarberia: {
            type: Number,
            min: 0,
            max: 100
        },
        montoFijoBarbero: Number,
        montoFijoBarberia: Number,
        activo: {
            type: Boolean,
            default: true
        },
        notas: String,
        fechaCreacion: {
            type: Date,
            default: Date.now
        }
    }],

    // OVERRIDES POR SERVICIO
    overridesPorServicio: [{
        servicioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Servicio',
            required: true
        },
        metodo: {
            type: String,
            enum: ['porcentaje', 'monto_fijo'],
            default: 'porcentaje'
        },
        porcentajeBarbero: {
            type: Number,
            min: 0,
            max: 100
        },
        porcentajeBarberia: {
            type: Number,
            min: 0,
            max: 100
        },
        montoFijoBarbero: Number,
        montoFijoBarberia: Number,
        activo: {
            type: Boolean,
            default: true
        },
        notas: String,
        fechaCreacion: {
            type: Date,
            default: Date.now
        }
    }],

    // CONFIGURACIÓN DE AJUSTES MANUALES
    ajustesPermitidos: {
        adminPuedeEditarMontos: {
            type: Boolean,
            default: true
        },
        adminPuedeEditarPorcentajes: {
            type: Boolean,
            default: true
        },
        barberoVeMontos: {
            type: Boolean,
            default: true
        },
        notificarCambios: {
            type: Boolean,
            default: true
        }
    },

    // CONFIGURACIÓN DE IMPUESTOS
    impuestos: {
        iva: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        retencion: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        aplicarIVA: {
            type: Boolean,
            default: false
        },
        aplicarRetencion: {
            type: Boolean,
            default: false
        }
    },

    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Índices
revenueConfigSchema.index({ 'overridesPorBarbero.barberoId': 1 });
revenueConfigSchema.index({ 'overridesPorServicio.servicioId': 1 });

// Validación: porcentajes deben sumar 100
revenueConfigSchema.pre('save', async function () {
    const config = this.configuracionGeneral;

    if (config.metodoPorcentaje === 'porcentaje') {
        const suma = config.porcentajeDefaultBarbero + config.porcentajeDefaultBarberia;
        if (suma !== 100) {
            throw new Error('Los porcentajes deben sumar 100%');
        }
    }

    // Validar overrides
    for (const override of this.overridesPorBarbero) {
        if (override.metodo === 'porcentaje') {
            const suma = (override.porcentajeBarbero || 0) + (override.porcentajeBarberia || 0);
            if (suma !== 100) {
                throw new Error('Los porcentajes del override deben sumar 100%');
            }
        }
    }
});

module.exports = mongoose.models.RevenueConfig || mongoose.model('RevenueConfig', revenueConfigSchema);


