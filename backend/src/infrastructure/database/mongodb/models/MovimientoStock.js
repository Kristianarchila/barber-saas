const mongoose = require("mongoose");

const movimientoStockSchema = new mongoose.Schema(
    {
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Producto",
            required: true,
        },
        inventario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Inventario",
            required: true,
        },
        barberia: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Barberia",
            required: true,
        },
        tipo: {
            type: String,
            enum: ["entrada", "salida", "ajuste", "venta", "devolucion"],
            required: true,
        },
        cantidad: {
            type: Number,
            required: true,
            min: 0,
        },
        cantidadAnterior: {
            type: Number,
            required: true,
        },
        cantidadNueva: {
            type: Number,
            required: true,
        },
        motivo: {
            type: String,
            required: true,
            trim: true,
        },
        proveedor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Proveedor",
        },
        pedido: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pedido",
        },
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        observaciones: {
            type: String,
            trim: true,
        },
        costoUnitario: {
            type: Number,
            min: 0,
        },
        costoTotal: {
            type: Number,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Índices para búsquedas frecuentes
movimientoStockSchema.index({ barberia: 1, createdAt: -1 });
movimientoStockSchema.index({ producto: 1, createdAt: -1 });
movimientoStockSchema.index({ inventario: 1, createdAt: -1 });
movimientoStockSchema.index({ tipo: 1, createdAt: -1 });

module.exports = mongoose.models.MovimientoStock || mongoose.model('MovimientoStock', movimientoStockSchema);


