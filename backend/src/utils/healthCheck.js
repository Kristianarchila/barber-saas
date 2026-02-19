/**
 * Health Check System
 * 
 * Monitorea el estado de todos los servicios críticos
 * y proporciona endpoints para verificar la salud del sistema.
 */

const mongoose = require('mongoose');
const { getConnectionStatus } = require('../config/db');

/**
 * Verificar salud de MongoDB
 */
async function checkMongoDB() {
    try {
        const status = getConnectionStatus();

        if (status.readyState !== 1) {
            return {
                status: 'unhealthy',
                message: `MongoDB ${status.readyStateText}`,
                details: status
            };
        }

        // Hacer un ping simple a la base de datos
        await mongoose.connection.db.admin().ping();

        return {
            status: 'healthy',
            message: 'MongoDB conectado y respondiendo',
            details: {
                host: status.host,
                database: status.name,
                readyState: status.readyStateText
            }
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            message: 'MongoDB no responde',
            error: error.message
        };
    }
}

/**
 * Verificar salud de Cloudinary
 */
async function checkCloudinary() {
    try {
        const cloudinary = require('../config/cloudinary').cloudinary;

        // Verificar que las credenciales estén configuradas
        const config = cloudinary.config();

        if (!config.cloud_name || !config.api_key || !config.api_secret) {
            return {
                status: 'degraded',
                message: 'Cloudinary configurado parcialmente',
                details: {
                    hasCloudName: !!config.cloud_name,
                    hasApiKey: !!config.api_key,
                    hasApiSecret: !!config.api_secret
                }
            };
        }

        // Cloudinary no tiene un endpoint de ping, pero podemos verificar config
        return {
            status: 'healthy',
            message: 'Cloudinary configurado correctamente',
            details: {
                cloud_name: config.cloud_name
            }
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            message: 'Error verificando Cloudinary',
            error: error.message
        };
    }
}

/**
 * Verificar salud del servicio de Email
 */
async function checkEmailService() {
    try {
        // Verificar que las variables de entorno estén configuradas
        const hasConfig = !!(
            process.env.EMAIL_USER &&
            process.env.EMAIL_PASS &&
            process.env.EMAIL_HOST
        );

        if (!hasConfig) {
            return {
                status: 'degraded',
                message: 'Servicio de email configurado parcialmente',
                details: {
                    hasUser: !!process.env.EMAIL_USER,
                    hasPass: !!process.env.EMAIL_PASS,
                    hasHost: !!process.env.EMAIL_HOST
                }
            };
        }

        return {
            status: 'healthy',
            message: 'Servicio de email configurado',
            details: {
                host: process.env.EMAIL_HOST,
                user: process.env.EMAIL_USER
            }
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            message: 'Error verificando servicio de email',
            error: error.message
        };
    }
}

/**
 * Verificar salud de Stripe
 */
async function checkStripe() {
    try {
        // Verificar que las credenciales estén configuradas
        const hasConfig = !!(
            process.env.STRIPE_SECRET_KEY &&
            process.env.STRIPE_PUBLISHABLE_KEY
        );

        if (!hasConfig) {
            return {
                status: 'degraded',
                message: 'Stripe configurado parcialmente',
                details: {
                    hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
                    hasPublishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY
                }
            };
        }

        // Verificar que la clave sea válida (formato)
        const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
        const isLiveMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_live_');

        if (!isTestMode && !isLiveMode) {
            return {
                status: 'unhealthy',
                message: 'Clave de Stripe inválida',
                details: {
                    keyFormat: 'invalid'
                }
            };
        }

        return {
            status: 'healthy',
            message: 'Stripe configurado correctamente',
            details: {
                mode: isTestMode ? 'test' : 'live'
            }
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            message: 'Error verificando Stripe',
            error: error.message
        };
    }
}

/**
 * Verificar salud general del sistema
 */
async function checkSystemHealth() {
    const startTime = Date.now();

    const [mongodb, cloudinary, email, stripe] = await Promise.all([
        checkMongoDB(),
        checkCloudinary(),
        checkEmailService(),
        checkStripe()
    ]);

    const services = { mongodb, cloudinary, email, stripe };

    // Determinar estado general
    const hasUnhealthy = Object.values(services).some(s => s.status === 'unhealthy');
    const hasDegraded = Object.values(services).some(s => s.status === 'degraded');

    let overallStatus = 'healthy';
    if (hasUnhealthy) {
        overallStatus = 'unhealthy';
    } else if (hasDegraded) {
        overallStatus = 'degraded';
    }

    const memoryUsage = process.memoryUsage();

    return {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        services,
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            rss: Math.round(memoryUsage.rss / 1024 / 1024),
            unit: 'MB'
        },
        version: process.env.npm_package_version || '1.0.0'
    };
}

/**
 * Health check básico (solo para verificar que el servidor responde)
 * Usado por load balancers para liveness probe
 */
function checkBasicHealth() {
    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    };
}

/**
 * Readiness check - Verifica si la app está lista para recibir tráfico
 * Usado por load balancers para readiness probe
 */
async function checkReadiness() {
    try {
        // Solo verificar servicios críticos (MongoDB)
        const mongodb = await checkMongoDB();

        if (mongodb.status === 'unhealthy') {
            return {
                ready: false,
                reason: 'MongoDB no disponible',
                timestamp: new Date().toISOString()
            };
        }

        return {
            ready: true,
            timestamp: new Date().toISOString(),
            services: {
                mongodb: mongodb.status
            }
        };
    } catch (error) {
        return {
            ready: false,
            reason: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = {
    checkSystemHealth,
    checkBasicHealth,
    checkReadiness,
    checkMongoDB,
    checkCloudinary,
    checkEmailService,
    checkStripe
};
