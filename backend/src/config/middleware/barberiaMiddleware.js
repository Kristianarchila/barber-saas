const Barberia = require("../../infrastructure/database/mongodb/models/Barberia");
const cacheService = require("../../infrastructure/cache/CacheService");

// TTL de 5 minutos para el lookup de barbería por slug.
// Los cambios de configuración tardarán máximo 5 min en reflejarse en el sitio público.
const BARBERIA_SLUG_TTL = 300;

/**
 * Middleware para obtener barbería por slug y agregarla a req.barberia
 * Usado en rutas públicas de reseñas.
 * Cachea el resultado por slug durante 5 minutos para evitar un query a
 * MongoDB en cada request (era el cuello de botella de ~180ms).
 */
exports.getBarberiaBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const cacheKey = `barberia:slug:${slug.toLowerCase()}`;

        let barberia = cacheService.get(cacheKey);

        if (!barberia) {
            barberia = await Barberia.findOne({
                slug: slug.toLowerCase(),
                activa: true
            }).lean(); // .lean() → plain JS object, faster and serializable for cache

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

            cacheService.set(cacheKey, barberia, BARBERIA_SLUG_TTL);
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
