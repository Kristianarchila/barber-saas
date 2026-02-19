/**
 * Reseñas Controller (Hexagonal Architecture Version)
 * Simplified implementation - matches legacy routes requirements
 */
const Resena = require("../infrastructure/database/mongodb/models/Resena");
const Reserva = require("../infrastructure/database/mongodb/models/Reserva");

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
            return res.status(404).json({ success: false, message: "Token inválido" });
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

        // Crear la reseña
        const nuevaResena = new Resena({
            reservaId: reserva._id,
            barberoId: reserva.barberoId,
            barberiaId: barberia._id,
            nombreCliente: reserva.nombreCliente,
            emailCliente: reserva.emailCliente,
            calificacionGeneral,
            calificacionServicio,
            calificacionAtencion,
            calificacionLimpieza,
            comentario,
            aprobada: false,
            visible: true,
            reviewToken
        });

        await nuevaResena.save();

        // Marcar reserva como reseñada
        reserva.hasReview = true;
        await reserva.save();

        res.status(201).json({
            success: true,
            message: "¡Gracias por tu reseña! Será publicada tras moderación.",
            data: nuevaResena
        });
    } catch (error) {
        console.error("Error al crear reseña:", error);
        res.status(500).json({ success: false, message: "Error al crear la reseña" });
    }
};

// Obtener reseñas públicas
exports.obtenerResenasPublicas = async (req, res) => {
    try {
        const { barberia } = req;
        const { barberoId, page = 1, limit = 10 } = req.query;

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

        res.json({
            success: true,
            data: {
                resenas,
                total,
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
        const query = { barberiaId: barberia._id, aprobada: true, visible: true };

        const resenas = await Resena.find(query);
        const total = resenas.length;

        if (total === 0) {
            return res.json({
                success: true,
                data: { total: 0, promedio: 0, distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
            });
        }

        const promedio = resenas.reduce((acc, r) => acc + r.calificacionGeneral, 0) / total;
        const distribucion = resenas.reduce((acc, r) => {
            acc[r.calificacionGeneral] = (acc[r.calificacionGeneral] || 0) + 1;
            return acc;
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

        res.json({
            success: true,
            data: {
                total,
                promedio: Math.round(promedio * 10) / 10,
                distribucion
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
        const resenas = await Resena.find({ barberiaId });
        const total = resenas.length;

        const stats = {
            total,
            pendientes: resenas.filter(r => !r.aprobada).length,
            aprobadas: resenas.filter(r => r.aprobada && r.visible).length,
            ocultas: resenas.filter(r => r.aprobada && !r.visible).length,
            promedio: total > 0 ? resenas.reduce((acc, r) => acc + r.calificacionGeneral, 0) / total : 0
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
        const resena = await Resena.findByIdAndUpdate(id, { aprobada: true, moderadaEn: new Date() }, { new: true });
        res.json({ success: true, message: "Reseña aprobada", data: resena });
    } catch (error) {
        console.error("Error al aprobar reseña:", error);
        res.status(500).json({ success: false, message: "Error al aprobar reseña" });
    }
};

exports.ocultarResena = async (req, res) => {
    try {
        const { id } = req.params;
        const resena = await Resena.findByIdAndUpdate(id, { visible: false }, { new: true });
        res.json({ success: true, message: "Reseña ocultada", data: resena });
    } catch (error) {
        console.error("Error al ocultar reseña:", error);
        res.status(500).json({ success: false, message: "Error al ocultar reseña" });
    }
};

exports.mostrarResena = async (req, res) => {
    try {
        const { id } = req.params;
        const resena = await Resena.findByIdAndUpdate(id, { visible: true }, { new: true });
        res.json({ success: true, message: "Reseña visible", data: resena });
    } catch (error) {
        console.error("Error al mostrar reseña:", error);
        res.status(500).json({ success: false, message: "Error al mostrar reseña" });
    }
};
