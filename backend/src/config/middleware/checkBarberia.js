const Barberia = require("../../infrastructure/database/mongodb/models/Barberia");

/**
 * Middleware para inyectar barberiaId en la request
 */
exports.filterByBarberia = (req, res, next) => {
    // Tomar de req.barberiaId (inyectado por extractBarberiaId) o req.user
    const barberiaId = req.barberiaId || req.user?.barberiaId;
    if (barberiaId) {
        req.barberiaId = barberiaId;
    }
    next();
};

/**
 * Middleware para asegurar que el body tenga la barberiaId correcta
 */
exports.validateBarberiaOwnership = (req, res, next) => {
    // 🔒 Seguridad: Asegurar que el body tenga la barberiaId correcta
    // Solo si hay body (POST/PUT) y el usuario es admin de barbería
    if (req.body && req.user?.rol === "BARBERIA_ADMIN") {
        req.body.barberiaId = req.user.barberiaId;
    }
    next();
};

/**
 * Middleware para bloquear el acceso si la barbería no está activa
 */
exports.checkBarberiaActiva = async (req, res, next) => {
    try {
        const barberiaId = req.barberiaId || req.user.barberiaId;

        if (!barberiaId) {
            // Si no hay barberiaId (ej: Super Admin), permitir pasar
            return next();
        }

        const barberia = await Barberia.findById(barberiaId);

        if (!barberia) {
            return res.status(404).json({ message: "Barbería no encontrada" });
        }

        if (!barberia.activa || barberia.estado === "suspendida") {
            return res.status(403).json({
                message: "Operación no permitida. La barbería se encuentra suspendida o inactiva."
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};
