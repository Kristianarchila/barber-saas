const mongoose = require("mongoose");

const proveedorSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
        },
        barberia: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Barberia",
            required: true,
        },
        contacto: {
            nombre: {
                type: String,
                trim: true,
            },
            cargo: {
                type: String,
                trim: true,
            },
        },
        telefono: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        direccion: {
            calle: String,
            ciudad: String,
            estado: String,
            codigoPostal: String,
        },
        rut: {
            type: String,
            trim: true,
        },
        productos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Producto",
            },
        ],
        notas: {
            type: String,
            trim: true,
        },
        activo: {
            type: Boolean,
            default: true,
        },
        // Términos comerciales
        diasPago: {
            type: Number,
            default: 30,
        },
        descuentoHabitual: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Índices
proveedorSchema.index({ barberia: 1, activo: 1 });
proveedorSchema.index({ barberia: 1, nombre: 1 });

module.exports = mongoose.models.Proveedor || mongoose.model('Proveedor', proveedorSchema);


