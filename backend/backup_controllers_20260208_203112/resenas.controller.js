const Resena = require("../models/Resena");
const Reserva = require("../models/Reserva");
const Barberia = require("../models/Barberia");
const User = require("../models/User");
const eventBus = require("../events");

/**
 * ========================================
 * ENDPOINTS PÚBLICOS
 * ========================================
 */

/**
 * Crear reseña con token válido
 * POST /api/public/:slug/resenas
 */
exports.crearResena = async (req, res) => {
    try {
        const { barberia } = req; // Viene del middleware
        const { reviewToken } = req.query;
        const {
            calificacionGeneral,
            calificacionServicio,
            calificacionAtencion,
            calificacionLimpieza,
            comentario
        } = req.body;

        // Validar que el token esté presente
        if (!reviewToken) {
            return res.status(200).json({
                success: false,
                message: "Token de reseña requerido",
                barberia: {
                    _id: barberia._id,
                    nombre: barberia.nombre,
                    slug: barberia.slug
                }
            });
        }

        // Buscar la reserva por token
        const reserva = await Reserva.findOne({ reviewToken })
            .populate("barberoId", "nombre")
            .populate("barberiaId", "nombre slug")
            .populate("servicioId", "nombre");

        if (!reserva) {
            return res.status(200).json({
                success: false,
                message: "Token de reseña inválido o expirado",
                barberia: {
                    _id: barberia._id,
                    nombre: barberia.nombre,
                    slug: barberia.slug
                }
            });
        }

        // Verificar que la reserva esté completada
        if (reserva.estado !== "COMPLETADA") {
            return res.status(200).json({
                success: false,
                message: "Solo puedes dejar reseña para servicios completados",
                barberia: {
                    _id: barberia._id,
                    nombre: barberia.nombre,
                    slug: barberia.slug
                }
            });
        }

        // Verificar que no exista ya una reseña para esta reserva
        const resenaExistente = await Resena.findOne({ reservaId: reserva._id });
        if (resenaExistente) {
            return res.status(200).json({
                success: false,
                message: "Ya existe una reseña para esta reserva",
                barberia: {
                    _id: barberia._id,
                    nombre: barberia.nombre,
                    slug: barberia.slug
                }
            });
        }

        // Verificar límite de tiempo (30 días)
        const diasDesdeCompletada = Math.floor(
            (Date.now() - new Date(reserva.completadaEn).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diasDesdeCompletada > 30) {
            return res.status(200).json({
                success: false,
                message: "El plazo para dejar reseña ha expirado (30 días)",
                barberia: {
                    _id: barberia._id,
                    nombre: barberia.nombre,
                    slug: barberia.slug
                }
            });
        }

        // Validar calificación general
        if (!calificacionGeneral || calificacionGeneral < 1 || calificacionGeneral > 5) {
            return res.status(200).json({
                success: false,
                message: "La calificación general debe estar entre 1 y 5",
                barberia: {
                    _id: barberia._id,
                    nombre: barberia.nombre,
                    slug: barberia.slug
                }
            });
        }

        // Crear la reseña
        const nuevaResena = new Resena({
            reservaId: reserva._id,
            barberoId: reserva.barberoId._id,
            barberiaId: reserva.barberiaId._id,
            nombreCliente: reserva.nombreCliente,
            emailCliente: reserva.emailCliente,
            calificacionGeneral,
            calificacionServicio,
            calificacionAtencion,
            calificacionLimpieza,
            comentario: comentario?.trim() || "",
            aprobada: false, // Requiere moderación
            visible: true,
            reviewToken
        });

        await nuevaResena.save();

        // Actualizar la reserva con el ID de la reseña
        reserva.resenaId = nuevaResena._id;
        await reserva.save();

        // Emitir evento para notificar al admin
        eventBus.emit("resena:creada", {
            resena: nuevaResena,
            barberia: reserva.barberiaId,
            reserva
        });

        res.status(200).json({
            success: true,
            message: "¡Gracias por tu reseña! Será publicada tras moderación.",
            barberia: {
                _id: barberia._id,
                nombre: barberia.nombre,
                slug: barberia.slug
            },
            data: nuevaResena
        });
    } catch (error) {
        console.error("Error al crear reseña:", error);
        res.status(200).json({
            success: false,
            message: "Error al crear la reseña",
            barberia: req.barberia ? {
                _id: req.barberia._id,
                nombre: req.barberia.nombre,
                slug: req.barberia.slug
            } : undefined,
            error: error.message
        });
    }
};

/**
 * Validar token de reseña (para verificar antes de mostrar formulario)
 * GET /api/public/:slug/resenas/validar-token
 */
exports.validarToken = async (req, res) => {
    try {
        const { barberia } = req;
        const { reviewToken } = req.query;

        if (!reviewToken) {
            return res.status(200).json({
                success: false,
                message: "Token requerido",
                barberia: {
                    _id: barberia._id,
                    nombre: barberia.nombre,
                    slug: barberia.slug
                }
            });
        }

        const reserva = await Reserva.findOne({ reviewToken })
            .populate("barberoId", "nombre")
            .populate("servicioId", "nombre duracion precio");

        if (!reserva) {
            return res.status(200).json({
                success: false,
                message: "Token inválido",
                barberia: {
                    _id: barberia._id,
                    nombre: barberia.nombre,
                    slug: barberia.slug
                }
            });
        }

        if (reserva.estado !== "COMPLETADA") {
            return res.status(200).json({
                success: false,
                message: "Servicio no completado",
                barberia: {
                    _id: barberia._id,
                    nombre: barberia.nombre,
                    slug: barberia.slug
                }
            });
        }

        // Verificar si ya existe reseña
        const resenaExistente = await Resena.findOne({ reservaId: reserva._id });
        if (resenaExistente) {
            return res.status(200).json({
                success: false,
                message: "Ya dejaste una reseña para este servicio",
                yaEnviada: true,
                barberia: {
                    _id: barberia._id,
                    nombre: barberia.nombre,
                    slug: barberia.slug
                }
            });
        }

        // Verificar límite de tiempo
        const diasDesdeCompletada = Math.floor(
            (Date.now() - new Date(reserva.completadaEn).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diasDesdeCompletada > 30) {
            return res.status(200).json({
                success: false,
                message: "El plazo para dejar reseña ha expirado (30 días)",
                expirado: true,
                barberia: {
                    _id: barberia._id,
                    nombre: barberia.nombre,
                    slug: barberia.slug
                }
            });
        }

        res.status(200).json({
            success: true,
            barberia: {
                _id: barberia._id,
                nombre: barberia.nombre,
                slug: barberia.slug
            },
            data: {
                reserva: {
                    nombreCliente: reserva.nombreCliente,
                    fecha: reserva.fecha,
                    hora: reserva.hora,
                    barbero: reserva.barberoId.nombre,
                    servicio: reserva.servicioId.nombre
                }
            }
        });
    } catch (error) {
        console.error("Error al validar token:", error);
        res.status(200).json({
            success: false,
            message: "Error al validar token",
            barberia: req.barberia ? {
                _id: req.barberia._id,
                nombre: req.barberia.nombre,
                slug: req.barberia.slug
            } : undefined,
            error: error.message
        });
    }
};

/**
 * Obtener reseñas públicas aprobadas de una barbería
 * GET /api/public/:slug/resenas
 */
exports.obtenerResenasPublicas = async (req, res) => {
    try {
        const { barberia } = req; // Viene del middleware getBarberiaBySlug
        const { barberoId, page = 1, limit = 10 } = req.query;

        const filtro = {
            barberiaId: barberia._id,
            aprobada: true,
            visible: true
        };

        if (barberoId) {
            filtro.barberoId = barberoId;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [resenas, total] = await Promise.all([
            Resena.find(filtro)
                .populate("barberoId", "nombre")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Resena.countDocuments(filtro)
        ]);

        // Calcular promedio general
        const todasResenas = await Resena.find({
            barberiaId: barberia._id,
            aprobada: true,
            visible: true
        });

        const promedio = todasResenas.length > 0
            ? todasResenas.reduce((sum, r) => sum + r.calificacionGeneral, 0) / todasResenas.length
            : 0;

        res.status(200).json({
            success: true,
            barberia: {
                _id: barberia._id,
                nombre: barberia.nombre,
                slug: barberia.slug
            },
            data: {
                resenas,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                promedio: Math.round(promedio * 10) / 10
            }
        });
    } catch (error) {
        console.error("Error al obtener reseñas públicas:", error);
        res.status(200).json({
            success: false,
            message: "Error al obtener reseñas",
            barberia: req.barberia ? {
                _id: req.barberia._id,
                nombre: req.barberia.nombre,
                slug: req.barberia.slug
            } : undefined,
            error: error.message
        });
    }
};

/**
 * Obtener estadísticas públicas de reseñas
 * GET /api/public/:slug/resenas/stats
 */
exports.obtenerEstadisticasPublicas = async (req, res) => {
    try {
        const { barberia } = req;

        const resenas = await Resena.find({
            barberiaId: barberia._id,
            aprobada: true,
            visible: true
        });

        if (resenas.length === 0) {
            return res.status(200).json({
                success: true,
                barberia: {
                    _id: barberia._id,
                    nombre: barberia.nombre,
                    slug: barberia.slug
                },
                data: {
                    total: 0,
                    promedio: 0,
                    distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                }
            });
        }

        const promedio = resenas.reduce((sum, r) => sum + r.calificacionGeneral, 0) / resenas.length;

        const distribucion = resenas.reduce((acc, r) => {
            acc[r.calificacionGeneral] = (acc[r.calificacionGeneral] || 0) + 1;
            return acc;
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

        res.status(200).json({
            success: true,
            barberia: {
                _id: barberia._id,
                nombre: barberia.nombre,
                slug: barberia.slug
            },
            data: {
                total: resenas.length,
                promedio: Math.round(promedio * 10) / 10,
                distribucion
            }
        });
    } catch (error) {
        console.error("Error al obtener estadísticas públicas:", error);
        res.status(200).json({
            success: false,
            message: "Error al obtener estadísticas",
            barberia: req.barberia ? {
                _id: req.barberia._id,
                nombre: req.barberia.nombre,
                slug: req.barberia.slug
            } : undefined,
            error: error.message
        });
    }
};

/**
 * ========================================
 * ENDPOINTS ADMIN
 * ========================================
 */

/**
 * Obtener reseñas pendientes de moderación
 * GET /api/admin/resenas/pendientes
 */
exports.obtenerResenasPendientes = async (req, res) => {
    try {
        const { barberiaId } = req.user;

        const resenas = await Resena.find({
            barberiaId,
            aprobada: false
        })
            .populate("barberoId", "nombre")
            .populate("reservaId", "fecha hora")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: resenas
        });
    } catch (error) {
        console.error("Error al obtener reseñas pendientes:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener reseñas pendientes",
            error: error.message
        });
    }
};

/**
 * Obtener reseñas aprobadas
 * GET /api/admin/resenas/aprobadas
 */
exports.obtenerResenasAprobadas = async (req, res) => {
    try {
        const { barberiaId } = req.user;
        const { visible } = req.query;

        const filtro = {
            barberiaId,
            aprobada: true
        };

        if (visible !== undefined) {
            filtro.visible = visible === "true";
        }

        const resenas = await Resena.find(filtro)
            .populate("barberoId", "nombre")
            .populate("reservaId", "fecha hora")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: resenas
        });
    } catch (error) {
        console.error("Error al obtener reseñas aprobadas:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener reseñas aprobadas",
            error: error.message
        });
    }
};

/**
 * Aprobar reseña
 * PATCH /api/admin/resenas/:id/aprobar
 */
exports.aprobarResena = async (req, res) => {
    try {
        const { id } = req.params;
        const { barberiaId, _id: userId } = req.user;

        const resena = await Resena.findOne({ _id: id, barberiaId });

        if (!resena) {
            return res.status(404).json({
                success: false,
                message: "Reseña no encontrada"
            });
        }

        resena.aprobada = true;
        resena.moderadaPor = userId;
        resena.moderadaEn = new Date();
        await resena.save();

        res.json({
            success: true,
            message: "Reseña aprobada exitosamente",
            data: resena
        });
    } catch (error) {
        console.error("Error al aprobar reseña:", error);
        res.status(500).json({
            success: false,
            message: "Error al aprobar reseña",
            error: error.message
        });
    }
};

/**
 * Ocultar reseña
 * PATCH /api/admin/resenas/:id/ocultar
 */
exports.ocultarResena = async (req, res) => {
    try {
        const { id } = req.params;
        const { barberiaId, _id: userId } = req.user;

        const resena = await Resena.findOne({ _id: id, barberiaId });

        if (!resena) {
            return res.status(404).json({
                success: false,
                message: "Reseña no encontrada"
            });
        }

        resena.visible = false;
        resena.moderadaPor = userId;
        resena.moderadaEn = new Date();
        await resena.save();

        res.json({
            success: true,
            message: "Reseña ocultada exitosamente",
            data: resena
        });
    } catch (error) {
        console.error("Error al ocultar reseña:", error);
        res.status(500).json({
            success: false,
            message: "Error al ocultar reseña",
            error: error.message
        });
    }
};

/**
 * Mostrar reseña
 * PATCH /api/admin/resenas/:id/mostrar
 */
exports.mostrarResena = async (req, res) => {
    try {
        const { id } = req.params;
        const { barberiaId, _id: userId } = req.user;

        const resena = await Resena.findOne({ _id: id, barberiaId });

        if (!resena) {
            return res.status(404).json({
                success: false,
                message: "Reseña no encontrada"
            });
        }

        resena.visible = true;
        resena.moderadaPor = userId;
        resena.moderadaEn = new Date();
        await resena.save();

        res.json({
            success: true,
            message: "Reseña visible nuevamente",
            data: resena
        });
    } catch (error) {
        console.error("Error al mostrar reseña:", error);
        res.status(500).json({
            success: false,
            message: "Error al mostrar reseña",
            error: error.message
        });
    }
};

/**
 * Obtener estadísticas detalladas (admin)
 * GET /api/admin/resenas/estadisticas
 */
exports.obtenerEstadisticas = async (req, res) => {
    try {
        const { barberiaId } = req.user;

        const [todasResenas, pendientes, aprobadas, ocultas] = await Promise.all([
            Resena.find({ barberiaId }),
            Resena.countDocuments({ barberiaId, aprobada: false }),
            Resena.countDocuments({ barberiaId, aprobada: true, visible: true }),
            Resena.countDocuments({ barberiaId, aprobada: true, visible: false })
        ]);

        const promedio = todasResenas.length > 0
            ? todasResenas.reduce((sum, r) => sum + r.calificacionGeneral, 0) / todasResenas.length
            : 0;

        const distribucion = todasResenas.reduce((acc, r) => {
            acc[r.calificacionGeneral] = (acc[r.calificacionGeneral] || 0) + 1;
            return acc;
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

        // Promedio por categoría
        const promedios = {
            general: 0,
            servicio: 0,
            atencion: 0,
            limpieza: 0
        };

        if (todasResenas.length > 0) {
            const resenasConCalificaciones = todasResenas.filter(r =>
                r.calificacionServicio && r.calificacionAtencion && r.calificacionLimpieza
            );

            if (resenasConCalificaciones.length > 0) {
                promedios.general = todasResenas.reduce((sum, r) => sum + r.calificacionGeneral, 0) / todasResenas.length;
                promedios.servicio = resenasConCalificaciones.reduce((sum, r) => sum + r.calificacionServicio, 0) / resenasConCalificaciones.length;
                promedios.atencion = resenasConCalificaciones.reduce((sum, r) => sum + r.calificacionAtencion, 0) / resenasConCalificaciones.length;
                promedios.limpieza = resenasConCalificaciones.reduce((sum, r) => sum + r.calificacionLimpieza, 0) / resenasConCalificaciones.length;
            }
        }

        res.json({
            success: true,
            data: {
                total: todasResenas.length,
                pendientes,
                aprobadas,
                ocultas,
                promedio: Math.round(promedio * 10) / 10,
                promedios: {
                    general: Math.round(promedios.general * 10) / 10,
                    servicio: Math.round(promedios.servicio * 10) / 10,
                    atencion: Math.round(promedios.atencion * 10) / 10,
                    limpieza: Math.round(promedios.limpieza * 10) / 10
                },
                distribucion
            }
        });
    } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener estadísticas",
            error: error.message
        });
    }
};
