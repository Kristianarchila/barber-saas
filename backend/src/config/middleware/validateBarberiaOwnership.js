/**
 * Middleware para validar que un recurso pertenece a la barbería del usuario
 * Debe usarse DESPUÉS de extractBarberiaId middleware
 * 
 * @param {Model} resourceModel - Modelo de Mongoose del recurso a validar
 * @returns {Function} Middleware function
 * 
 * @example
 * router.get('/:id', 
 *   protect, 
 *   extractBarberiaId, 
 *   validateBarberiaOwnership(ReservaModel), 
 *   getReserva
 * );
 */
exports.validateBarberiaOwnership = (resourceModel) => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params.id;
            const userBarberiaId = req.barberiaId;

            // Validar que barberiaId esté disponible
            if (!userBarberiaId) {
                return res.status(400).json({
                    message: 'barberiaId no disponible. Asegúrate de usar extractBarberiaId middleware.'
                });
            }

            // Validar que resourceId esté presente
            if (!resourceId) {
                return res.status(400).json({
                    message: 'ID del recurso no proporcionado'
                });
            }

            // Buscar recurso
            const resource = await resourceModel.findById(resourceId);

            if (!resource) {
                return res.status(404).json({
                    message: 'Recurso no encontrado'
                });
            }

            // Validar ownership (permitir SuperAdmin bypass)
            if (req.user.rol !== 'SUPER_ADMIN') {
                const resourceBarberiaId = resource.barberiaId?.toString();

                if (!resourceBarberiaId) {
                    return res.status(500).json({
                        message: 'Recurso no tiene barberiaId asociado'
                    });
                }

                if (resourceBarberiaId !== userBarberiaId.toString()) {
                    console.warn('🚨 SECURITY: Cross-barbería access attempt', {
                        userId: req.user._id,
                        userBarberia: userBarberiaId,
                        resourceBarberia: resourceBarberiaId,
                        resourceType: resourceModel.modelName,
                        resourceId
                    });

                    return res.status(403).json({
                        message: 'No tienes permiso para acceder a este recurso'
                    });
                }
            }

            // Adjuntar recurso al request para reutilización
            req.resource = resource;
            next();
        } catch (error) {
            console.error('❌ Error en validateBarberiaOwnership middleware:', error);
            res.status(500).json({
                message: 'Error al validar permisos del recurso'
            });
        }
    };
};

/**
 * Helper para inyectar automáticamente barberiaId en queries
 * Útil para queries de búsqueda/listado
 * 
 * @param {Object} query - Query object de Mongoose
 * @param {String} barberiaId - ID de la barbería
 * @returns {Object} Query con barberiaId inyectado
 */
exports.injectBarberiaFilter = (query, barberiaId) => {
    if (!barberiaId) {
        throw new Error('barberiaId es requerido para inyectar filtro');
    }

    return {
        ...query,
        barberiaId
    };
};

/**
 * Middleware para validar que el usuario tenga acceso a la barbería
 * Versión simplificada que solo valida sin buscar recurso
 */
exports.requireBarberiaAccess = async (req, res, next) => {
    try {
        const userBarberiaId = req.barberiaId;

        if (!userBarberiaId && req.user.rol !== 'SUPER_ADMIN') {
            return res.status(403).json({
                message: 'No tienes acceso a ninguna barbería'
            });
        }

        next();
    } catch (error) {
        console.error('❌ Error en requireBarberiaAccess middleware:', error);
        res.status(500).json({
            message: 'Error al validar acceso a barbería'
        });
    }
};
