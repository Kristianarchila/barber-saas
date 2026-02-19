const mongoose = require('mongoose');

/**
 * ApprovalRequest Model
 * Tracks account approval requests for audit and compliance
 */
const approvalRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    barberiaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barberia'
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    reviewedAt: {
        type: Date
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    notes: {
        type: String
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    metadata: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
approvalRequestSchema.index({ userId: 1, status: 1 });
approvalRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ApprovalRequest', approvalRequestSchema);
