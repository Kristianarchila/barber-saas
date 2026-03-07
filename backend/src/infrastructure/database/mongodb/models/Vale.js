const mongoose = require("mongoose");

/**
 * Modelo de Vale — registra adelantos / anticipos entregados a barberos.
 * Se descuenta del pago final de comisiones del barbero en el período.
 */
const valeSchema = new mongoose.Schema({
    // Multi-tenant
    barberiaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Barberia",
        required: true,
        index: true
    },

    // A qué barbero se le entregó el vale
    barberoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Barbero",
        required: true,
        index: true
    },

    // Información del vale
    fecha: {
        type: String,   // YYYY-MM-DD — mismo patrón que Egreso
        required: true,
        index: true
    },
    descripcion: {
        type: String,
        required: true,
        default: "Adelanto de comisión"
    },
    monto: {
        type: Number,
        required: true,
        min: 1
    },

    // Método de entrega
    metodoPago: {
        type: String,
        enum: ["EFECTIVO", "TRANSFERENCIA", "OTRO"],
        default: "EFECTIVO"
    },

    // Estado del vale: PENDIENTE = aún no descontado, DESCONTADO = ya aplicado a liquidación
    estado: {
        type: String,
        enum: ["PENDIENTE", "DESCONTADO"],
        default: "PENDIENTE",
        index: true
    },

    // Quién autorizó el vale
    autorizadoPor: {
        type: String
    },

    // Soft delete
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Índices compuestos para queries del reporte
valeSchema.index({ barberiaId: 1, fecha: -1 });
valeSchema.index({ barberiaId: 1, barberoId: 1, fecha: -1 });
valeSchema.index({ barberiaId: 1, estado: 1 });

module.exports = mongoose.models.Vale || mongoose.model("Vale", valeSchema);
