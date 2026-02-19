const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
    {
        barberiaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Barberia",
            required: true,
            index: true
        },
        plan: {
            type: String,
            enum: ['FREE', 'BASIC', 'PRO', 'PREMIUM', 'basico', 'pro', 'premium'],
            required: true,
            default: 'FREE'
        },
        status: {
            type: String,
            enum: ["ACTIVE", "CANCELED", "INCOMPLETE", "PAST_DUE", "TRIALING"],
            required: true,
            default: 'TRIALING'
        },
        stripeSubscriptionId: {
            type: String,
            sparse: true, // Allow null for manual subscriptions
            unique: true
        },
        stripeCustomerId: {
            type: String,
            sparse: true // Allow null for manual subscriptions
        },
        stripePriceId: {
            type: String
        },
        currentPeriodStart: {
            type: Date
        },
        currentPeriodEnd: {
            type: Date
        },
        cancelAtPeriodEnd: {
            type: Boolean,
            default: false
        },
        trialEndsAt: {
            type: Date
        },
        paymentMethod: {
            type: String,
            enum: ['STRIPE', 'MANUAL', 'FLOW', 'TRANSBANK', 'MERCADOPAGO'],
            default: 'STRIPE'
        },
        manualPayments: [{
            amount: {
                type: Number,
                required: true
            },
            concept: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                required: true,
                default: Date.now
            },
            recordedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            metadata: {
                type: mongoose.Schema.Types.Mixed,
                default: {}
            }
        }],
        changeHistory: [{
            from: {
                type: mongoose.Schema.Types.Mixed,
                required: true
            },
            to: {
                type: mongoose.Schema.Types.Mixed,
                required: true
            },
            date: {
                type: Date,
                required: true,
                default: Date.now
            },
            changedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            reason: {
                type: String,
                default: ''
            },
            type: {
                type: String,
                enum: ['PLAN_CHANGE', 'STATUS_CHANGE', 'PERIOD_EXTENSION'],
                required: true
            },
            metadata: {
                type: mongoose.Schema.Types.Mixed,
                default: {}
            }
        }],
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    { timestamps: true }
);

// Indexes for efficient queries
subscriptionSchema.index({ barberiaId: 1, status: 1 });
subscriptionSchema.index({ paymentMethod: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });

module.exports = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
