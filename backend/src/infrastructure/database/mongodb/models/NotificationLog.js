const mongoose = require("mongoose");

const notificationLogSchema = new mongoose.Schema(
    {
        barberia: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Barberia",
            required: true,
        },
        tipo: {
            type: String,
            enum: ["push", "email", "whatsapp"],
            required: true,
        },
        destinatario: {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            email: String,
            telefono: String,
        },
        asunto: {
            type: String,
        },
        contenido: {
            type: String,
            required: true,
        },
        estado: {
            type: String,
            enum: ["enviado", "fallido", "pendiente"],
            default: "pendiente",
        },
        errorMensaje: {
            type: String,
        },
        reserva: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reserva",
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Índices para búsqueda rápida
notificationLogSchema.index({ barberia: 1, createdAt: -1 });
notificationLogSchema.index({ "destinatario.user": 1 });
notificationLogSchema.index({ reserva: 1 });

module.exports = mongoose.models.NotificationLog || mongoose.model('NotificationLog', notificationLogSchema);


