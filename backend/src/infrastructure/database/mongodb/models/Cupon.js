const mongoose = require("mongoose");

const cuponSchema = new mongoose.Schema(
    {
        codigo: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        barberia: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Barberia",
            required: true,
        },
        tipo: {
            type: String,
            enum: ["porcentaje", "monto_fijo"],
            required: true,
        },
        valor: {
            type: Number,
            required: true,
            min: 0,
        },
        descripcion: {
            type: String,
            trim: true,
        },
        fechaInicio: {
            type: Date,
            required: true,
        },
        fechaExpiracion: {
            type: Date,
            required: true,
        },
        usoMaximo: {
            type: Number,
            default: null, // null = ilimitado
        },
        usosPorUsuario: {
            type: Number,
            default: 1,
        },
        usosActuales: {
            type: Number,
            default: 0,
        },
        montoMinimo: {
            type: Number,
            default: 0,
        },
        aplicableA: {
            type: String,
            enum: ["todos", "servicios", "productos"],
            default: "todos",
        },
        serviciosEspecificos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Servicio",
            },
        ],
        productosEspecificos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Producto",
            },
        ],
        activo: {
            type: Boolean,
            default: true,
        },
        creadoPor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Índices
cuponSchema.index({ barberia: 1, codigo: 1 }, { unique: true });
cuponSchema.index({ barberia: 1, activo: 1 });
cuponSchema.index({ fechaExpiracion: 1 });

// Virtual para verificar si está vigente
cuponSchema.virtual("vigente").get(function () {
    const now = new Date();
    return (
        this.activo &&
        this.fechaInicio <= now &&
        this.fechaExpiracion >= now &&
        (this.usoMaximo === null || this.usosActuales < this.usoMaximo)
    );
});

// Asegurar virtuals en JSON
cuponSchema.set("toJSON", { virtuals: true });
cuponSchema.set("toObject", { virtuals: true });

module.exports = mongoose.models.Cupon || mongoose.model('Cupon', cuponSchema);


