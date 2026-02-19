const mongoose = require("mongoose");

const usoCuponSchema = new mongoose.Schema(
    {
        cupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cupon",
            required: true,
        },
        barberia: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Barberia",
            required: true,
        },
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        reserva: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reserva",
        },
        pedido: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pedido",
        },
        montoOriginal: {
            type: Number,
            required: true,
        },
        descuentoAplicado: {
            type: Number,
            required: true,
        },
        montoFinal: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Índices
usoCuponSchema.index({ cupon: 1, usuario: 1 });
usoCuponSchema.index({ barberia: 1, createdAt: -1 });

module.exports = mongoose.models.UsoCupon || mongoose.model('UsoCupon', usoCuponSchema);


