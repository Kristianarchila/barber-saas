const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
    barberiaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barberia',
        required: true,
        index: true
    },
    barberoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // El barbero que realizó/recibe comisión de la venta
        index: true
    },
    items: [{
        type: {
            type: String,
            enum: ['servicio', 'producto'],
            required: true
        },
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        nombre: {
            type: String,
            required: true
        },
        precio: {
            type: Number,
            required: true
        },
        cantidad: {
            type: Number,
            default: 1
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    subtotal: {
        type: Number,
        required: true,
        default: 0
    },
    descuento: {
        type: Number,
        default: 0
    },
    iva: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true,
        default: 0
    },
    metodoPago: {
        type: String,
        enum: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO'],
        default: 'EFECTIVO'
    },
    fecha: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Índices compuestos para busquedas frecuentes
ventaSchema.index({ barberiaId: 1, fecha: -1 });
ventaSchema.index({ barberiaId: 1, barberoId: 1 });

module.exports = mongoose.models.Venta || mongoose.model('Venta', ventaSchema);
