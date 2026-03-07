const Barberia = require('../infrastructure/database/mongodb/models/Barberia');
const TenantIsolationError = require('../shared/errors/TenantIsolationError');
const logger = require('../config/logger');

/**
 * Middleware para extraer barberiaId del slug en la URL
 * Convierte /api/barberias/:slug/... → req.barberiaId
 * 
 * Debe usarse ANTES de validateTenantAccess
 * 
 * @example
 * app.use('/api/barberias/:slug/admin', extractBarberiaId, validateTenantAccess, adminRoutes);
 */
exports.extractBarberiaId = async (req, res, next) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.status(400).json({
                message: 'Slug de barbería requerido en la URL'
            });
        }

        // Buscar barbería por slug
        const barberia = await Barberia.findOne({ slug, activa: true })
            .select('_id nombre slug')
            .lean();

        if (!barberia) {
            return res.status(404).json({
                message: 'Barbería no encontrada'
            });
        }

        // Agregar barberiaId al request para uso en controladores
        req.barberiaId = barberia._id;
        req.barberia = barberia; // Info adicional si se necesita

        next();
    } catch (error) {
        logger.error('Error extrayendo barberiaId del slug', {
            slug: req.params.slug,
            error: error.message
        });
        next(error);
    }
};

/**
 * Middleware para validar que el usuario tiene acceso a la barbería
 * Compara req.user.barberiaId con req.barberiaId (del slug)
 * 
 * Debe usarse DESPUÉS de protect (autenticación) y extractBarberiaId
 * 
 * @example
 * app.use('/api/barberias/:slug/admin', protect, extractBarberiaId, validateTenantAccess);
 */
exports.validateTenantAccess = async (req, res, next) => {
    try {
        // Verificar que el usuario está autenticado
        if (!req.user) {
            return res.status(401).json({
                message: 'Autenticación requerida'
            });
        }

        // Verificar que tenemos barberiaId del slug
        if (!req.barberiaId) {
            logger.error('validateTenantAccess llamado sin barberiaId en request');
            return res.status(500).json({
                message: 'Error de configuración del servidor'
            });
        }

        const userBarberiaId = req.user.barberiaId?.toString();
        const requestBarberiaId = req.barberiaId.toString();


        // SUPERADMIN tiene acceso a todas las barberías
        if (req.user.rol === 'SUPER_ADMIN') {
            logger.info('Acceso SUPER_ADMIN permitido', {
                userId: req.user._id,
                barberiaId: requestBarberiaId
            });
            return next();
        }

        // 🔒 VALIDACIÓN CRÍTICA: Usuario debe pertenecer a la barbería del slug
        if (userBarberiaId !== requestBarberiaId) {
            logger.warn('🚨 INTENTO DE ACCESO CROSS-TENANT BLOQUEADO', {
                userId: req.user._id,
                userEmail: req.user.email,
                userBarberiaId,
                requestedBarberiaId: requestBarberiaId,
                url: req.originalUrl,
                method: req.method,
                ip: req.ip,
                userAgent: req.headers?.['user-agent']
            });

            // 📝 REGISTRAR EN AUDIT LOG — fire-and-forget (non-blocking)
            const AuditLog = require('../infrastructure/database/mongodb/models/AuditLog');
            AuditLog.logCrossTenantAttempt({
                userId: req.user._id,
                userBarberiaId,
                attemptedBarberiaId: requestBarberiaId,
                request: {
                    ip: req.ip,
                    userAgent: req.headers?.['user-agent'],
                    method: req.method,
                    url: req.originalUrl,
                    params: req.params,
                    query: req.query
                }
            }).catch(auditErr => {
                logger.error('Error registrando audit log de cross-tenant', { error: auditErr.message });
            });

            // Responder directamente con 403 — sin lanzar excepción
            return res.status(403).json({
                message: 'No tienes permiso para acceder a los datos de esta barbería',
                code: 'TENANT_ISOLATION_VIOLATION'
            });
        }

        // ✅ Acceso permitido
        logger.debug('Acceso tenant validado', {
            userId: req.user._id,
            barberiaId: requestBarberiaId
        });

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware para validar acceso multi-sede
 * Permite acceso si el usuario tiene la barbería en su array barberiaIds
 * 
 * Usado para usuarios que gestionan múltiples sedes
 */
exports.validateMultiSedeAccess = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Autenticación requerida' });
        }

        if (!req.barberiaId) {
            return res.status(500).json({ message: 'Error de configuración' });
        }

        // SUPERADMIN siempre tiene acceso
        if (req.user.rol === 'SUPER_ADMIN') {
            return next();
        }

        const requestBarberiaId = req.barberiaId.toString();
        const userBarberiaIds = (req.user.barberiaIds || []).map(id => id.toString());

        // Verificar si el usuario tiene acceso a esta barbería
        const hasAccess =
            req.user.barberiaId?.toString() === requestBarberiaId ||
            userBarberiaIds.includes(requestBarberiaId);

        if (!hasAccess) {
            logger.warn('Acceso multi-sede denegado', {
                userId: req.user._id,
                requestedBarberiaId: requestBarberiaId,
                userBarberiaIds
            });

            throw new TenantIsolationError(
                'No tienes permiso para acceder a esta barbería'
            );
        }

        next();
    } catch (error) {
        if (error instanceof TenantIsolationError) {
            return res.status(403).json({ message: error.message });
        }
        next(error);
    }
};

/**
 * Middleware para validar que un recurso específico pertenece al tenant
 * Útil para rutas como GET /api/reservas/:id
 * 
 * @param {String} modelName - Nombre del modelo Mongoose
 * @param {String} paramName - Nombre del parámetro en req.params (default: 'id')
 * 
 * @example
 * router.get('/reservas/:id', protect, validateResourceTenant('Reserva'), getReserva);
 */
exports.validateResourceTenant = (modelName, paramName = 'id') => {
    return async (req, res, next) => {
        try {
            const Model = require(`../infrastructure/database/mongodb/models/${modelName}`);
            const resourceId = req.params[paramName];
            const barberiaId = req.barberiaId || req.user?.barberiaId;

            if (!barberiaId) {
                return res.status(500).json({
                    message: 'Error de configuración: barberiaId no disponible'
                });
            }

            const resource = await Model.findOne({
                _id: resourceId,
                barberiaId
            }).select('_id barberiaId');

            if (!resource) {
                return res.status(404).json({
                    message: `${modelName} no encontrado`
                });
            }

            // Recurso validado, continuar
            next();
        } catch (error) {
            logger.error('Error validando tenant del recurso', {
                modelName,
                paramName,
                error: error.message
            });
            next(error);
        }
    };
};
