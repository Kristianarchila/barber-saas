/**
 * Tenant Isolation Middleware
 * Ensures multi-tenant data isolation and security
 */

/**
 * Require active tenant (barberia)
 * Use this middleware on all tenant-specific routes
 * 
 * @example
 * router.use(protect);
 * router.use(requireActiveTenant);
 * router.get('/barberos', getBarberos);
 */
exports.requireActiveTenant = (req, res, next) => {
    // SuperAdmin can access any tenant
    if (req.user.rol === 'SUPER_ADMIN') {
        return next();
    }

    // Validate barberiaId exists
    if (!req.user.barberiaId) {
        return res.status(403).json({
            message: "No tienes barbería asignada. Contacta a soporte."
        });
    }

    // Double-check estadoCuenta (defense in depth)
    if (req.user.estadoCuenta !== 'ACTIVA') {
        return res.status(403).json({
            message: "Tu cuenta está pendiente de aprobación"
        });
    }

    next();
};

/**
 * Inject barberiaId into query filters
 * Automatically adds barberiaId to req for tenant isolation
 */
exports.injectTenantFilter = (req, res, next) => {
    if (req.user.rol !== 'SUPER_ADMIN' && req.user.barberiaId) {
        req.tenantId = req.user.barberiaId;
    }
    next();
};

/**
 * Validate resource belongs to tenant
 * Use this to verify a resource (barbero, servicio, etc.) belongs to user's barberia
 * 
 * @param {Model} Model - Mongoose model to query
 * @param {string} resourceIdParam - Name of the param containing resource ID (default: 'id')
 * 
 * @example
 * router.get('/barberos/:id', 
 *   protect, 
 *   validateResourceOwnership(Barbero, 'id'),
 *   getBarberoById
 * );
 */
exports.validateResourceOwnership = (Model, resourceIdParam = 'id') => {
    return async (req, res, next) => {
        try {
            // SuperAdmin bypass
            if (req.user.rol === 'SUPER_ADMIN') {
                return next();
            }

            const resourceId = req.params[resourceIdParam];
            const resource = await Model.findOne({
                _id: resourceId,
                barberiaId: req.user.barberiaId
            });

            if (!resource) {
                return res.status(404).json({ message: "Recurso no encontrado" });
            }

            req.resource = resource;
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = exports;
