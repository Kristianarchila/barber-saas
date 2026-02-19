const Barberia = require("../../infrastructure/database/mongodb/models/Barberia");

/**
 * Middleware para obtener barbería por slug y agregarla a req.barberia
 * Usado en rutas públicas de reseñas
 */
exports.getBarberiaBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const barberia = await Barberia.findOne({
            slug: slug.toLowerCase(),
            activa: true
        });

        if (!barberia) {
            return res.status(404).json({
                success: false,
                message: "Barbería no encontrada"
            });
        }

        if (barberia.estado === 'suspendida') {
            return res.status(403).json({
                success: false,
                message: "Esta barbería no está disponible actualmente"
            });
        }

        // Inyectar barbería en el request
        req.barberia = barberia;
        next();
    } catch (error) {
        console.error("Error en middleware getBarberiaBySlug:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener barbería"
        });
    }
};
