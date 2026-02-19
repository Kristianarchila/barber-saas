const Barberia = require("../../infrastructure/database/mongodb/models/Barberia");

/**
 * Middleware para extraer el barberiaId a partir del slug en los params
 * y verificar que el usuario tenga acceso.
 */
exports.extractBarberiaId = async (req, res, next) => {
    try {
        const { slug } = req.params;
        console.log('🛡️ MIDDLEWARE extractBarberiaId - slug:', slug);
        console.log('🛡️ MIDDLEWARE extractBarberiaId - params:', req.params);


        // Si no hay slug en los params, intentamos usar el del usuario (si está logueado)
        if (!slug) {
            if (req.user && req.user.barberiaId) {
                req.barberiaId = req.user.barberiaId;
                return next();
            }
            return res.status(400).json({ message: "Slug de barbería no proporcionado" });
        }

        // Buscar barbería por slug
        const barberia = await Barberia.findOne({ slug: slug.toLowerCase() });

        if (!barberia) {
            return res.status(404).json({ message: "Barbería no encontrada" });
        }

        // Seguridad: Verificar que el admin pertenezca a esta barbería
        // (A menos que sea Super Admin)
        console.log('🛡️ User info:', { id: req.user._id, rol: req.user.rol, barberiaId: req.user.barberiaId });
        console.log('🛡️ Target barberia:', { id: barberia._id, slug: barberia.slug });

        if (req.user.rol !== 'SUPER_ADMIN') {
            const hasAccess =
                (req.user.barberiaId && req.user.barberiaId.toString() === barberia._id.toString()) ||
                (req.user.barberiaIds && req.user.barberiaIds.some(id => id.toString() === barberia._id.toString()));

            if (!hasAccess) {
                console.log('❌ Permission mismatch:', {
                    userBarberia: req.user.barberiaId,
                    userBarberiaIds: req.user.barberiaIds,
                    target: barberia._id
                });
                return res.status(403).json({ message: "No tienes permiso para acceder a esta barbería" });
            }
        }

        req.barberiaId = barberia._id;
        next();
    } catch (error) {
        console.error("❌ Error en extractBarberiaId middleware:", error);
        res.status(500).json({ message: "Error al procesar el identificador de la barbería" });
    }
};
