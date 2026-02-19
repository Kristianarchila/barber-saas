/**
 * Retry Utility with Exponential Backoff
 * 
 * Reintenta operaciones fallidas con delays crecientes
 * para dar tiempo a que los servicios se recuperen.
 */

/**
 * Ejecuta una función con reintentos automáticos
 * 
 * @param {Function} fn - Función a ejecutar
 * @param {Object} options - Opciones de retry
 * @param {number} options.maxRetries - Número máximo de reintentos (default: 3)
 * @param {number} options.initialDelay - Delay inicial en ms (default: 1000)
 * @param {number} options.maxDelay - Delay máximo en ms (default: 10000)
 * @param {number} options.backoffMultiplier - Multiplicador para backoff exponencial (default: 2)
 * @param {Function} options.onRetry - Callback ejecutado en cada reintento
 * @param {Array<Error>} options.retryableErrors - Tipos de error que deben reintentar
 * @returns {Promise<any>}
 */
async function retryWithBackoff(fn, options = {}) {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 10000,
        backoffMultiplier = 2,
        onRetry = null,
        retryableErrors = [] // Si está vacío, reintenta todos los errores
    } = options;

    let lastError;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Verificar si el error es reintentar
            if (retryableErrors.length > 0) {
                const shouldRetry = retryableErrors.some(
                    ErrorClass => error instanceof ErrorClass || error.name === ErrorClass.name
                );

                if (!shouldRetry) {
                    throw error; // No reintentar este tipo de error
                }
            }

            // Si es el último intento, lanzar el error
            if (attempt === maxRetries) {
                console.error(`❌ Retry fallido después de ${maxRetries} intentos:`, error.message);
                throw error;
            }

            // Calcular delay con backoff exponencial
            const currentDelay = Math.min(delay, maxDelay);

            console.warn(`⚠️ Intento ${attempt + 1}/${maxRetries} falló. Reintentando en ${currentDelay}ms...`);

            // Callback opcional
            if (onRetry) {
                onRetry(error, attempt + 1, currentDelay);
            }

            // Esperar antes del siguiente intento
            await sleep(currentDelay);

            // Incrementar delay para el próximo intento
            delay *= backoffMultiplier;
        }
    }

    throw lastError;
}

/**
 * Utilidad para esperar un tiempo determinado
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wrapper para operaciones de base de datos con retry automático
 */
async function retryDatabaseOperation(fn, operationName = 'Database operation') {
    return retryWithBackoff(fn, {
        maxRetries: 3,
        initialDelay: 500,
        maxDelay: 5000,
        onRetry: (error, attempt, delay) => {
            console.warn(`🔄 [${operationName}] Reintento ${attempt}/3 en ${delay}ms - Error: ${error.message}`);
        }
    });
}

/**
 * Wrapper para llamadas a servicios externos con retry
 */
async function retryExternalService(fn, serviceName = 'External service') {
    return retryWithBackoff(fn, {
        maxRetries: 2,
        initialDelay: 1000,
        maxDelay: 3000,
        onRetry: (error, attempt, delay) => {
            console.warn(`🌐 [${serviceName}] Reintento ${attempt}/2 en ${delay}ms - Error: ${error.message}`);
        }
    });
}

module.exports = {
    retryWithBackoff,
    retryDatabaseOperation,
    retryExternalService,
    sleep
};
