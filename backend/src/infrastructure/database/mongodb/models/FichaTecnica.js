const mongoose = require("mongoose");

const historialServicioSchema = new mongoose.Schema({
    fecha: {
        type: Date,
        default: Date.now
    },
    barberoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Barbero",
        required: true
    },
    servicioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Servicio"
    },
    notaTecnica: {
        type: String,
        trim: true
    },
    fotos: [{
        type: String // URLs de Cloudinary
    }]
}, { timestamps: true });

const fichaTecnicaSchema = new mongoose.Schema({
    clienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    barberiaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Barberia",
        required: true
    },
    // Preferencias constantes o alertas (ej: piel sensible)
    notasGenerales: {
        type: String,
        trim: true
    },
    historialServicios: [historialServicioSchema]
}, { timestamps: true });

// Índices para búsquedas rápidas por cliente y barbería (Multi-tenant)
fichaTecnicaSchema.index({ clienteId: 1, barberiaId: 1 }, { unique: true });

module.exports = mongoose.models.FichaTecnica || mongoose.model('FichaTecnica', fichaTecnicaSchema);


