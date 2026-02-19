/**
 * Reseñas Controller (Hexagonal Architecture Version)
 * Simplified implementation - matches legacy routes requirements
 */
const Resena = require("../infrastructure/database/mongodb/models/Resena");
const Reserva = require("../infrastructure/database/mongodb/models/Reserva");
const { recalcularEstadisticasResenas } = require("../services/resenas.service");
const { detectarSpam, tokenExpirado } = require("../services/antiSpam.service");

/**
 * ========================================
 * ENDPOINTS PÚBLICOS
 * ========================================
 */

// Validar token de reseña
exports.validarToken = async (req, res) => {
    try {
        const { reviewToken } = req.query;

        if (!reviewToken) {
            return res.status(400).json({ success: false, message: "Token requerido" });
        }

        const reserva = await Reserva.findOne({ reviewToken })
            .populate("barberoId", "nombre")
            .populate("servicioId", "nombre");

        if (!reserva) {
            return res.status(404).json({ success: false, valido: false, message: "Token inválido" });
        }

        // ✅ NUEVO: Validar expiración del token (30 días)
        if (tokenExpirado(reserva.reviewTokenExpiry)) {
            return res.status(410).json({
                success: false,
                valido: false,
                message: "El token ha expirado. Por favor, contacta con la barbería."
            });
        }

        if (reserva.estado !== "COMPLETADA") {
            return res.status(400).json({ success: false, message: "Servicio no completado" });
        }

        // Verificar si ya existe reseña
        const resenaExistente = await Resena.findOne({ reservaId: reserva._id });
        if (resenaExistente) {
            return res.status(200).json({
                success: false,
                message: "Ya dejaste una reseña para este servicio",
                yaEnviada: true
            });
        }

        res.json({
            success: true,
            valido: true,
            data: {
                nombreCliente: reserva.nombreCliente,
                barbero: reserva.barberoId?.nombre,
                servicio: reserva.servicioId?.nombre,
                fecha: reserva.fecha
            }
        });
    } catch (error) {
        console.error("Error al validar token:", error);
        res.status(500).json({ success: false, message: "Error al validar token" });
    }
};

// Crear reseña
exports.crearResena = async (req, res) => {
    try {
        const { barberia } = req;
        const { reviewToken } = req.query;
        const {
            calificacionGeneral,
            calificacionServicio,
            calificacionAtencion,
            calificacionLimpieza,
            comentario
        } = req.body;

        const reserva = await Reserva.findOne({ reviewToken });

        if (!reserva) {
            return res.status(404).json({ success: false, message: "Reserva no encontrada" });
        }

        // ✅ NUEVO: Validar expiración del token
        if (tokenExpirado(reserva.reviewTokenExpiry)) {
            return res.status(410).json({
                success: false,
                message: "El token ha expirado. Por favor, contacta con la barbería."
            });
        }

        const configResenas = barberia.configuracion?.configuracionResenas || {
            habilitadas: true,
            moderacionAutomatica: false,
            calificacionMinima: 1
        };

        if (!configResenas.habilitadas) {
            return res.status(403).json({ success: false, message: "Las reseñas están deshabilitadas temporalmente" });
        }

        // ✅ NUEVO: Detectar spam
        const resultadoSpam = await detectarSpam({
            emailCliente: reserva.emailCliente,
            comentario,
            calificacionGeneral,
            barberiaId: barberia._id
        });

        // Determinar si se aprueba automáticamente
        let aprobada = false;
        if (configResenas.moderacionAutomatica && !resultadoSpam.esSpam) {
            if (calificacionGeneral >= configResenas.calificacionMinima) {
                aprobada = true;
            }
        }

        // Crear la reseña
        const nuevaResena = new Resena({
            reservaId: reserva._id,
            barberoId: reserva.barberoId,
            barberiaId: barberia._id,
            servicioId: reserva.servicioId, // ✅ NUEVO: Guardar servicio calificado
            nombreCliente: reserva.nombreCliente,
            emailCliente: reserva.emailCliente,
            calificacionGeneral,
            calificacionServicio,
            calificacionAtencion,
            calificacionLimpieza,
            comentario,
            aprobada,
            visible: true,
            reviewToken,
            marcadaComoSpam: resultadoSpam.esSpam, // ✅ NUEVO: Anti-spam
            razonSpam: resultadoSpam.razon // ✅ NUEVO: Razón de spam
        });

        await nuevaResena.save();

        // Marcar reserva como reseñada
        reserva.hasReview = true;
        await reserva.save();

        res.status(201).json({
            success: true,
            message: aprobada
                ? "¡Gracias por tu reseña! Ha sido publicada."
                : "¡Gracias por tu reseña! Será publicada tras moderación.",
            data: nuevaResena
        });
    } catch (error) {
        // Handle duplicate key error (e.g., duplicate reservaId or reviewToken)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Ya existe una reseña para esta reserva"
            });
        }

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message
            }));
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors
            });
        }

        console.error("Error al crear reseña:", error);
        res.status(500).json({ success: false, message: "Error al crear la reseña" });
    }
};

// Obtener reseñas públicas
exports.obtenerResenasPublicas = async (req, res) => {
    try {
        const { barberia } = req;
        const { barberoId, page = 1, limit = 10 } = req.query;

        const configResenas = barberia.configuracion?.configuracionResenas || { mostrarEnWeb: true };

        if (configResenas.mostrarEnWeb === false) {
            return res.json({
                success: true,
                data: {
                    resenas: [],
                    total: 0,
                    promedio: 0,
                    page: 1,
                    totalPages: 0
                }
            });
        }

        const query = {
            barberiaId: barberia._id,
            aprobada: true,
            visible: true
        };

        if (barberoId) query.barberoId = barberoId;

        const resenas = await Resena.find(query)
            .populate("barberoId", "nombre")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Resena.countDocuments(query);

        const promedio = total > 0
            ? resenas.reduce((acc, r) => acc + r.calificacionGeneral, 0) / (resenas.length || 1)
            : 0;

        res.json({
            success: true,
            data: {
                resenas,
                total,
                promedio: Math.round(promedio * 10) / 10,
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error("Error al obtener reseñas:", error);
        res.status(500).json({ success: false, message: "Error al obtener reseñas" });
    }
};

// Estadísticas públicas
exports.obtenerEstadisticasPublicas = async (req, res) => {
    try {
        const { barberia } = req;

        // 🚀 OPTIMIZACIÓN: Usar estadísticas pre-calculadas del modelo Barbería
        if (barberia.estadisticasResenas && barberia.estadisticasResenas.ratingCount > 0) {
            return res.json({
                success: true,
                data: {
                    total: barberia.estadisticasResenas.ratingCount,
                    promedio: barberia.estadisticasResenas.ratingAverage,
                    distribucion: barberia.estadisticasResenas.distribucion
                }
            });
        }

        // Fallback: Si no hay estadísticas pre-calculadas, retornar valores por defecto
        res.json({
            success: true,
            data: {
                total: 0,
                promedio: 0,
                distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            }
        });
    } catch (error) {
        console.error("Error al obtener estadísticas públicas:", error);
        res.status(500).json({ success: false, message: "Error al obtener estadísticas" });
    }
};

/**
 * ========================================
 * ENDPOINTS ADMIN
 * ========================================
 */

exports.obtenerResenasPendientes = async (req, res) => {
    try {
        const { barberiaId } = req.user;

        // ✅ SEGURIDAD: Solo reseñas de la barbería del admin autenticado
        const resenas = await Resena.find({ barberiaId, aprobada: false })
            .populate("barberoId", "nombre")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: resenas });
    } catch (error) {
        console.error("Error al obtener reseñas pendientes:", error);
        res.status(500).json({ success: false, message: "Error al obtener reseñas" });
    }
};

exports.obtenerResenasAprobadas = async (req, res) => {
    try {
        const { barberiaId } = req.user;

        // ✅ SEGURIDAD: Solo reseñas de la barbería del admin autenticado
        const resenas = await Resena.find({ barberiaId, aprobada: true })
            .populate("barberoId", "nombre")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: resenas });
    } catch (error) {
        console.error("Error al obtener reseñas aprobadas:", error);
        res.status(500).json({ success: false, message: "Error al obtener reseñas" });
    }
};

exports.obtenerEstadisticas = async (req, res) => {
    try {
        const { barberiaId } = req.user;

        // ✅ SEGURIDAD: Solo estadísticas de la barbería del admin autenticado
        const resenas = await Resena.find({ barberiaId });
        const total = resenas.length;

        const porCalificacion = resenas.reduce((acc, r) => {
            acc[r.calificacionGeneral] = (acc[r.calificacionGeneral] || 0) + 1;
            return acc;
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

        const stats = {
            total,
            pendientes: resenas.filter(r => !r.aprobada).length,
            aprobadas: resenas.filter(r => r.aprobada && r.visible).length,
            ocultas: resenas.filter(r => r.aprobada && !r.visible).length,
            promedio: total > 0 ? resenas.reduce((acc, r) => acc + r.calificacionGeneral, 0) / total : 0,
            distribucion: porCalificacion
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        res.status(500).json({ success: false, message: "Error al obtener estadísticas" });
    }
};

exports.aprobarResena = async (req, res) => {
    try {
        const { id } = req.params;
        const { barberiaId, _id: adminId } = req.user;

        // 🔒 SEGURIDAD CRÍTICA: Validar que la reseña pertenece a la barbería del admin
        const resena = await Resena.findOne({ _id: id, barberiaId });

        if (!resena) {
            return res.status(404).json({
                success: false,
                message: "Reseña no encontrada o no tienes permisos para modificarla"
            });
        }

        // Actualizar reseña
        resena.aprobada = true;
        resena.moderadaEn = new Date();
        resena.moderadaPor = adminId;
        await resena.save();

        // 🚀 OPTIMIZACIÓN: Recalcular estadísticas de la barbería
        await recalcularEstadisticasResenas(barberiaId);

        res.json({ success: true, message: "Reseña aprobada", data: resena });
    } catch (error) {
        console.error("Error al aprobar reseña:", error);
        res.status(500).json({ success: false, message: "Error al aprobar reseña" });
    }
};

exports.ocultarResena = async (req, res) => {
    try {
        const { id } = req.params;
        const { barberiaId } = req.user;

        // 🔒 SEGURIDAD CRÍTICA: Validar que la reseña pertenece a la barbería del admin
        const resena = await Resena.findOne({ _id: id, barberiaId });

        if (!resena) {
            return res.status(404).json({
                success: false,
                message: "Reseña no encontrada o no tienes permisos para modificarla"
            });
        }

        // Actualizar reseña
        resena.visible = false;
        await resena.save();

        // 🚀 OPTIMIZACIÓN: Recalcular estadísticas de la barbería
        await recalcularEstadisticasResenas(barberiaId);

        res.json({ success: true, message: "Reseña ocultada", data: resena });
    } catch (error) {
        console.error("Error al ocultar reseña:", error);
        res.status(500).json({ success: false, message: "Error al ocultar reseña" });
    }
};

exports.mostrarResena = async (req, res) => {
    try {
        const { id } = req.params;
        const { barberiaId } = req.user;

        // 🔒 SEGURIDAD CRÍTICA: Validar que la reseña pertenece a la barbería del admin
        const resena = await Resena.findOne({ _id: id, barberiaId });

        if (!resena) {
            return res.status(404).json({
                success: false,
                message: "Reseña no encontrada o no tienes permisos para modificarla"
            });
        }

        // Actualizar reseña
        resena.visible = true;
        await resena.save();

        // 🚀 OPTIMIZACIÓN: Recalcular estadísticas de la barbería
        await recalcularEstadisticasResenas(barberiaId);

        res.json({ success: true, message: "Reseña visible", data: resena });
    } catch (error) {
        console.error("Error al mostrar reseña:", error);
        res.status(500).json({ success: false, message: "Error al mostrar reseña" });
    }
};

// ✅ NUEVO: Responder a reseña
exports.responderResena = async (req, res) => {
    try {
        const { id } = req.params;
        const { texto } = req.body;
        const { _id: adminId, barberiaId } = req.user;

        if (!texto || texto.trim().length === 0) {
            return res.status(400).json({ success: false, message: "El texto de la respuesta es requerido" });
        }

        // 🔒 SEGURIDAD CRÍTICA: Validar que la reseña pertenece a la barbería del admin
        const resena = await Resena.findOne({ _id: id, barberiaId });

        if (!resena) {
            return res.status(404).json({
                success: false,
                message: "Reseña no encontrada o no tienes permisos para responderla"
            });
        }

        // Actualizar respuesta
        resena.respuestaAdmin = {
            texto: texto.trim(),
            fecha: new Date(),
            adminId
        };
        await resena.save();

        // Poblar barbero para respuesta
        await resena.populate("barberoId", "nombre");

        res.json({ success: true, message: "Respuesta agregada exitosamente", data: resena });
    } catch (error) {
        console.error("Error al responder reseña:", error);
        res.status(500).json({ success: false, message: "Error al responder reseña" });
    }
};
