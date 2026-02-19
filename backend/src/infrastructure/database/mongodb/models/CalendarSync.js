const mongoose = require('mongoose');

const calendarSyncSchema = new mongoose.Schema({
    barberoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barbero',
        required: true
    },
    barberiaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barberia',
        required: true
    },
    provider: {
        type: String,
        enum: ['google', 'outlook'],
        required: true
    },
    accessToken: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    email: {
        type: String, // The email of the connected account
        required: true
    },
    externalCalendarId: {
        type: String,
        default: 'primary'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Avoid multiple connections of same provider for same barbero
calendarSyncSchema.index({ barberoId: 1, provider: 1 }, { unique: true });
calendarSyncSchema.index({ barberiaId: 1 });

const CalendarSync = mongoose.model('CalendarSync', calendarSyncSchema);

module.exports = CalendarSync;
