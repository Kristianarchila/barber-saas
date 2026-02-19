const mongoose = require("mongoose");

const pushSubscriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        barberia: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Barberia",
            required: true,
        },
        endpoint: {
            type: String,
            required: true,
        },
        keys: {
            p256dh: {
                type: String,
                required: true,
            },
            auth: {
                type: String,
                required: true,
            },
        },
        userAgent: {
            type: String,
        },
        activo: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Índice único para evitar suscripciones duplicadas
pushSubscriptionSchema.index({ user: 1, endpoint: 1 }, { unique: true });

module.exports = mongoose.models.PushSubscription || mongoose.model('PushSubscription', pushSubscriptionSchema);


