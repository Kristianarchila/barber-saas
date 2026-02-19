const mongoose = require("mongoose");

const inventarioSchema = new mongoose.Schema(
    {
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Producto",
            required: true,
        },
        barberia: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Barberia",
            required: true,
        },
        cantidadActual: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        stockMinimo: {
            type: Number,
            default: 5,
            min: 0,
        },
        stockMaximo: {
            type: Number,
            default: 100,
            min: 0,
        },
        ubicacion: {
            type: String,
            trim: true,
        },
        unidadMedida: {
            type: String,
            enum: ["unidad", "kg", "litro", "caja", "paquete"],
            default: "unidad",
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

// Índice único: un producto solo puede tener un registro de inventario por barbería
inventarioSchema.index({ producto: 1, barberia: 1 }, { unique: true });

// Índice para búsquedas frecuentes
inventarioSchema.index({ barberia: 1, activo: 1 });

// Virtual para verificar si está bajo stock
inventarioSchema.virtual("bajoPuntoReorden").get(function () {
    return this.cantidadActual <= this.stockMinimo;
});

// Asegurar que los virtuals se incluyan en JSON
inventarioSchema.set("toJSON", { virtuals: true });
inventarioSchema.set("toObject", { virtuals: true });

module.exports = mongoose.models.Inventario || mongoose.model('Inventario', inventarioSchema);


