const mongoose = require("mongoose");

const resenaSchema = new mongoose.Schema(
    {
        // Relaciones (Multi-tenant)
        reservaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reserva",
            required: true
            // unique index defined in schema.index below
        },
        barberoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Barbero",
            required: true
        },
        barberiaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Barberia",
            required: true
        },
        servicioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Servicio",
            required: false // Opcional por compatibilidad con reseñas existentes
        },

        // Datos del cliente
        nombreCliente: {
            type: String,
            required: true
        },
        emailCliente: {
            type: String,
            required: true
        },

        // Calificaciones (1-5 estrellas)
        calificacionGeneral: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        calificacionServicio: {
            type: Number,
            min: 1,
            max: 5
        },
        calificacionAtencion: {
            type: Number,
            min: 1,
            max: 5
        },
        calificacionLimpieza: {
            type: Number,
            min: 1,
            max: 5
        },

        // Comentario
        comentario: {
            type: String,
            maxlength: 500,
            trim: true
        },

        // Moderación (solo BARBERIA_ADMIN)
        aprobada: {
            type: Boolean,
            default: false
        },
        visible: {
            type: Boolean,
            default: true
        },
        moderadaPor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        moderadaEn: {
            type: Date
        },

        // ✅ NUEVO: Respuesta del administrador
        respuestaAdmin: {
            texto: {
                type: String,
                maxlength: 500,
                trim: true
            },
            fecha: {
                type: Date
            },
            adminId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        },

        // ✅ NUEVO: Sistema Anti-Spam
        marcadaComoSpam: {
            type: Boolean,
            default: false
        },
        razonSpam: {
            type: String,
            enum: ['duplicada', 'patron_sospechoso', 'contenido_repetitivo', 'manual'],
            sparse: true
        },

        // Token para dejar reseña (seguridad)
        reviewToken: {
            type: String,
            sparse: true
        }
    },
    { timestamps: true }
);

// Índices para queries eficientes
resenaSchema.index({ barberiaId: 1, aprobada: 1 });
resenaSchema.index({ barberoId: 1, aprobada: 1 });
resenaSchema.index({ reservaId: 1 }, { unique: true }); // Una reseña por reserva
resenaSchema.index({ reviewToken: 1 }, { unique: true, sparse: true }); // Sparse for optional field
resenaSchema.index({ createdAt: -1 });
resenaSchema.index({ servicioId: 1, aprobada: 1 }); // ✅ NUEVO: Para filtrar por servicio

// ✅ NUEVO: Índice compuesto optimizado para query más frecuente
// Query: { barberiaId, aprobada: true, visible: true } ORDER BY createdAt DESC
resenaSchema.index({ barberiaId: 1, aprobada: 1, visible: 1, createdAt: -1 });

// Método virtual para promedio de calificaciones específicas
resenaSchema.virtual("promedioEspecifico").get(function () {
    const calificaciones = [
        this.calificacionServicio,
        this.calificacionAtencion,
        this.calificacionLimpieza
    ].filter(c => c != null);

    if (calificaciones.length === 0) return null;

    return (
        calificaciones.reduce((sum, c) => sum + c, 0) / calificaciones.length
    );
});

module.exports = mongoose.models.Resena || mongoose.model('Resena', resenaSchema);


