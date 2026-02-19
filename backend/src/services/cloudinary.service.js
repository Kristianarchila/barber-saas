/**
 * Resilient Cloudinary Service Wrapper
 * 
 * Envuelve las operaciones de Cloudinary con circuit breaker,
 * retry logic y graceful degradation.
 */

const { cloudinary } = require('../config/cloudinary');
const CircuitBreaker = require('../utils/circuitBreaker');
const { retryExternalService } = require('../utils/retry');
const Logger = require('../shared/Logger');

// Circuit breaker para Cloudinary
const cloudinaryBreaker = new CircuitBreaker({
    name: 'Cloudinary',
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 30000, // 30 segundos
    fallback: () => {
        Logger.warn('CloudinaryService', 'Circuit breaker OPEN - Usando fallback');
        return null; // Retornar null cuando Cloudinary no está disponible
    }
});

/**
 * Subir imagen a Cloudinary con resiliencia
 */
async function uploadImage(fileBuffer, options = {}) {
    try {
        return await cloudinaryBreaker.execute(async () => {
            return await retryExternalService(
                () => uploadToCloudinary(fileBuffer, options),
                'Cloudinary Upload'
            );
        });
    } catch (error) {
        Logger.error('CloudinaryService', 'Error subiendo imagen', error, {
            folder: options.folder,
            circuitState: cloudinaryBreaker.getState()
        });

        // Graceful degradation: retornar null en lugar de fallar
        return null;
    }
}

/**
 * Función interna para subir a Cloudinary
 */
function uploadToCloudinary(fileBuffer, options) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: options.folder || 'barberias',
                transformation: options.transformation || [],
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
}

/**
 * Eliminar imagen de Cloudinary con resiliencia
 */
async function deleteImage(publicId) {
    try {
        return await cloudinaryBreaker.execute(async () => {
            return await retryExternalService(
                () => cloudinary.uploader.destroy(publicId),
                'Cloudinary Delete'
            );
        });
    } catch (error) {
        Logger.error('CloudinaryService', 'Error eliminando imagen', error, {
            publicId,
            circuitState: cloudinaryBreaker.getState()
        });

        // No es crítico si falla la eliminación
        return { result: 'error', error: error.message };
    }
}

/**
 * Obtener URL de imagen con transformaciones
 */
function getImageUrl(publicId, transformations = []) {
    try {
        if (!publicId) return null;

        return cloudinary.url(publicId, {
            transformation: transformations,
            secure: true
        });
    } catch (error) {
        Logger.error('CloudinaryService', 'Error generando URL', error, { publicId });
        return null;
    }
}

/**
 * Obtener estado del circuit breaker
 */
function getServiceStatus() {
    return cloudinaryBreaker.getState();
}

/**
 * Resetear circuit breaker manualmente
 */
function resetCircuitBreaker() {
    cloudinaryBreaker.reset();
    Logger.info('CloudinaryService', 'Circuit breaker reseteado manualmente');
}

module.exports = {
    uploadImage,
    deleteImage,
    getImageUrl,
    getServiceStatus,
    resetCircuitBreaker
};
