const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDeletePlugin");

const waitingListSchema = new mongoose.Schema(
    {
        barberiaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Barberia",
            required: true,
            index: true
        },
        barberoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        servicioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Servicio",
            required: true
        },
        clienteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true
        },

        // Información del cliente (puede no estar registrado)
        clienteEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        clienteTelefono: {
            type: String,
            trim: true
        },
        clienteNombre: {
            type: String,
            required: true,
            trim: true
        },

        // Preferencias de horario
        fechaPreferida: {
            type: Date,
            required: true
        },
        rangoHorario: {
            inicio: {
                type: String,
                required: true,
                match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
            },
            fin: {
                type: String,
                required: true,
                match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
            }
        },
        diasPreferidos: [{
            type: String,
            enum: ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]
        }],

        // Estado
        estado: {
            type: String,
            enum: ["ACTIVA", "NOTIFICADA", "CONVERTIDA", "EXPIRADA", "CANCELADA"],
            default: "ACTIVA",
            index: true
        },

        // Prioridad (menor número = mayor prioridad)
        prioridad: {
            type: Number,
            default: 0
        },

        // Token único para conversión
        token: {
            type: String,
            unique: true,
            sparse: true
        },

        // Metadata
        notificadoEn: {
            type: Date
        },
        expiraEn: {
            type: Date,
            index: true
        },
        convertidaEn: {
            type: Date
        },
        canceladaEn: {
            type: Date
        },

        // Referencia a la reserva si se convirtió
        reservaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reserva"
        },

        // Notas internas
        notas: {
            type: String
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Índices compuestos para búsquedas eficientes
waitingListSchema.index({ barberiaId: 1, estado: 1, createdAt: 1 });
waitingListSchema.index({ barberoId: 1, estado: 1, fechaPreferida: 1 });
waitingListSchema.index({ estado: 1, expiraEn: 1 });
waitingListSchema.index({ clienteEmail: 1, barberiaId: 1 });

// Virtual para calcular posición en la lista
waitingListSchema.virtual("posicion").get(function () {
    // Esto se calculará en el use case
    return this._posicion || null;
});

// Método para verificar si está expirada
waitingListSchema.methods.isExpired = function () {
    return this.estado === "NOTIFICADA" && this.expiraEn && this.expiraEn < new Date();
};

// Método para verificar si puede ser notificada
waitingListSchema.methods.canBeNotified = function () {
    return this.estado === "ACTIVA";
};

// Apply soft delete plugin
waitingListSchema.plugin(softDeletePlugin);

module.exports = mongoose.models.WaitingList || mongoose.model("WaitingList", waitingListSchema);
