const mongoose = require('mongoose');

/**
 * @file Bloqueo.js
 * @description MongoDB schema for date/time blocking
 */

const bloqueoSchema = new mongoose.Schema(
    {
        barberiaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Barberia',
            required: [true, 'La barbería es obligatoria'],
            index: true
        },
        barberoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Barbero',
            default: null,
            index: true
        },
        tipo: {
            type: String,
            enum: {
                values: ['VACACIONES', 'FERIADO', 'EMERGENCIA', 'OTRO'],
                message: 'Tipo de bloqueo inválido'
            },
            required: [true, 'El tipo de bloqueo es obligatorio']
        },
        fechaInicio: {
            type: Date,
            required: [true, 'La fecha de inicio es obligatoria']
        },
        fechaFin: {
            type: Date,
            required: [true, 'La fecha de fin es obligatoria'],
            validate: {
                validator: function (value) {
                    return value >= this.fechaInicio;
                },
                message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio'
            }
        },
        horaInicio: {
            type: String,
            default: null,
            validate: {
                validator: function (value) {
                    if (!value) return true;
                    return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(value);
                },
                message: 'Formato de hora inválido (debe ser HH:MM)'
            }
        },
        horaFin: {
            type: String,
            default: null,
            validate: {
                validator: function (value) {
                    if (!value) return true;
                    return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(value);
                },
                message: 'Formato de hora inválido (debe ser HH:MM)'
            }
        },
        motivo: {
            type: String,
            required: [true, 'El motivo es obligatorio'],
            trim: true,
            maxlength: [500, 'El motivo no puede exceder 500 caracteres']
        },
        todoElDia: {
            type: Boolean,
            default: true
        },
        activo: {
            type: Boolean,
            default: true,
            index: true
        },
        creadoPor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for efficient queries
bloqueoSchema.index({ barberiaId: 1, fechaInicio: 1, fechaFin: 1 });
bloqueoSchema.index({ barberiaId: 1, barberoId: 1, activo: 1 });
bloqueoSchema.index({ barberiaId: 1, activo: 1, fechaInicio: 1 });

// Virtual for checking if blocking is currently active (date-wise)
bloqueoSchema.virtual('estaVigente').get(function () {
    const now = new Date();
    return this.activo &&
        now >= this.fechaInicio &&
        now <= this.fechaFin;
});

// Method to check if a specific date/time is blocked
bloqueoSchema.methods.bloqueaFechaHora = function (fecha, hora = null) {
    if (!this.activo) return false;

    const fechaCheck = new Date(fecha);
    fechaCheck.setHours(0, 0, 0, 0);

    const inicio = new Date(this.fechaInicio);
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date(this.fechaFin);
    fin.setHours(23, 59, 59, 999);

    // Check if date is within range
    if (fechaCheck < inicio || fechaCheck > fin) {
        return false;
    }

    // If it's a full day blocking, it blocks
    if (this.todoElDia) {
        return true;
    }

    // If partial blocking and no hour provided, assume it might block
    if (!hora) {
        return true;
    }

    // Check if hour is within blocked range
    const [horaNum, minNum] = hora.split(':').map(Number);
    const [inicioHora, inicioMin] = this.horaInicio.split(':').map(Number);
    const [finHora, finMin] = this.horaFin.split(':').map(Number);

    const horaMinutos = horaNum * 60 + minNum;
    const inicioMinutos = inicioHora * 60 + inicioMin;
    const finMinutos = finHora * 60 + finMin;

    return horaMinutos >= inicioMinutos && horaMinutos < finMinutos;
};

module.exports = mongoose.models.Bloqueo || mongoose.model('Bloqueo', bloqueoSchema);
