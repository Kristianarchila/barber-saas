/**
 * API Error Handler with Retry Logic
 * Centralized error handling for all API calls
 */

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * User-friendly error messages map
 */
const ERROR_MESSAGES = {
    // Network errors
    'Network Error': 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
    'ERR_NETWORK': 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
    'ERR_CONNECTION_REFUSED': 'El servidor no está disponible en este momento.',
    'ECONNABORTED': 'La solicitud tardó demasiado tiempo. Intenta nuevamente.',

    // HTTP status codes
    400: 'Los datos enviados no son válidos.',
    401: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    403: 'No tienes permiso para realizar esta acción.',
    404: 'El recurso solicitado no fue encontrado.',
    409: 'El horario seleccionado ya no está disponible. Por favor, elige otro horario.',
    422: 'Los datos enviados no son válidos.',
    429: 'Demasiadas solicitudes. Por favor, espera un momento.',
    500: 'Error del servidor. Estamos trabajando en solucionarlo.',
    502: 'El servidor no está disponible temporalmente.',
    503: 'El servicio no está disponible. Intenta más tarde.',
    504: 'El servidor tardó demasiado en responder.',

    // Custom error types
    'ReservationConflictError': 'El horario seleccionado ya no está disponible. Por favor, elige otro horario.',
    'TenantIsolationError': 'No tienes permiso para acceder a estos datos.',
    'ValidationError': 'Los datos ingresados no son válidos.',
    'NotFoundError': 'El recurso solicitado no fue encontrado.'
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error) {
    // Check for custom error type
    if (error.response?.data?.error?.type) {
        const customMessage = ERROR_MESSAGES[error.response.data.error.type];
        if (customMessage) return customMessage;
    }

    // Check for HTTP status code
    if (error.response?.status) {
        const statusMessage = ERROR_MESSAGES[error.response.status];
        if (statusMessage) return statusMessage;
    }

    // Check for network error
    if (error.code) {
        const codeMessage = ERROR_MESSAGES[error.code];
        if (codeMessage) return codeMessage;
    }

    if (error.message) {
        const messageMatch = ERROR_MESSAGES[error.message];
        if (messageMatch) return messageMatch;
    }

    // Use backend error message if available and user-friendly
    if (error.response?.data?.error?.message) {
        return error.response.data.error.message;
    }

    // Default fallback
    return 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error) {
    // Network errors are retryable
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        return true;
    }

    // Timeout errors are retryable
    if (error.message === 'Network Error') {
        return true;
    }

    // 5xx server errors are retryable (except 501)
    if (error.response?.status >= 500 && error.response?.status !== 501) {
        return true;
    }

    // 429 Too Many Requests is retryable
    if (error.response?.status === 429) {
        return true;
    }

    return false;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attemptNumber) {
    return RETRY_DELAY_MS * Math.pow(2, attemptNumber - 1);
}

/**
 * Retry wrapper for API calls
 * @param {Function} apiCall - Function that returns a Promise
 * @param {Object} options - Retry options
 * @returns {Promise}
 */
export async function withRetry(apiCall, options = {}) {
    const {
        maxRetries = MAX_RETRIES,
        onRetry = null,
        retryCondition = isRetryableError
    } = options;

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await apiCall();
        } catch (error) {
            lastError = error;

            // Don't retry if it's the last attempt
            if (attempt === maxRetries) {
                break;
            }

            // Don't retry if error is not retryable
            if (!retryCondition(error)) {
                break;
            }

            // Calculate delay with exponential backoff
            const delay = getRetryDelay(attempt);

            // Notify about retry
            if (onRetry) {
                onRetry(attempt, delay, error);
            }

            console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);

            // Wait before retrying
            await sleep(delay);
        }
    }

    // All retries failed, throw the last error
    throw lastError;
}

/**
 * API call wrapper with error handling and retry
 * @param {Function} apiCall - Function that returns a Promise
 * @param {Object} options - Options
 * @returns {Promise}
 */
export async function apiRequest(apiCall, options = {}) {
    const {
        enableRetry = true,
        maxRetries = MAX_RETRIES,
        onRetry = null,
        onError = null
    } = options;

    try {
        if (enableRetry) {
            return await withRetry(apiCall, { maxRetries, onRetry });
        } else {
            return await apiCall();
        }
    } catch (error) {
        // Get user-friendly message
        const userMessage = getUserFriendlyMessage(error);

        // Create enhanced error object
        const enhancedError = {
            ...error,
            userMessage,
            isRetryable: isRetryableError(error),
            originalError: error
        };

        // Call error callback if provided
        if (onError) {
            onError(enhancedError);
        }

        throw enhancedError;
    }
}

/**
 * React Hook for API calls with error handling
 */
export function useApiRequest() {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [retryCount, setRetryCount] = React.useState(0);

    const execute = async (apiCall, options = {}) => {
        setLoading(true);
        setError(null);
        setRetryCount(0);

        try {
            const result = await apiRequest(apiCall, {
                ...options,
                onRetry: (attempt, delay, err) => {
                    setRetryCount(attempt);
                    if (options.onRetry) {
                        options.onRetry(attempt, delay, err);
                    }
                }
            });

            setLoading(false);
            return result;
        } catch (err) {
            setError(err);
            setLoading(false);
            throw err;
        }
    };

    const retry = async (apiCall, options = {}) => {
        return execute(apiCall, options);
    };

    const reset = () => {
        setLoading(false);
        setError(null);
        setRetryCount(0);
    };

    return {
        loading,
        error,
        retryCount,
        execute,
        retry,
        reset
    };
}

export default {
    apiRequest,
    withRetry,
    getUserFriendlyMessage,
    isRetryableError,
    useApiRequest
};
