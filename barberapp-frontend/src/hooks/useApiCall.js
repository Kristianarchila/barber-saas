import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { captureException } from '../services/errorTracking';

/**
 * Hook para manejar llamadas API con manejo de errores centralizado
 * 
 * @param {Function} apiFunction - Función async que hace la llamada API
 * @param {Object} options - Opciones de configuración
 * @param {string} options.successMessage - Mensaje de éxito (opcional)
 * @param {string} options.errorMessage - Mensaje de error personalizado (opcional)
 * @param {Function} options.onSuccess - Callback en caso de éxito
 * @param {Function} options.onError - Callback en caso de error
 * @param {boolean} options.showSuccessToast - Mostrar toast de éxito (default: false)
 * @param {boolean} options.showErrorToast - Mostrar toast de error (default: true)
 * 
 * @returns {Object} { execute, loading, error, data, reset }
 * 
 * @example
 * const { execute, loading, error } = useApiCall(getAgendaBarbero, {
 *   errorMessage: 'Error al cargar la agenda',
 *   onSuccess: (data) => setReservas(data)
 * });
 * 
 * // Ejecutar
 * await execute(fecha);
 */
export function useApiCall(apiFunction, options = {}) {
    const {
        successMessage,
        errorMessage = 'Ocurrió un error. Por favor, intenta nuevamente.',
        onSuccess,
        onError,
        showSuccessToast = false,
        showErrorToast = true,
    } = options;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const execute = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError(null);

            const result = await apiFunction(...args);
            setData(result);

            // Toast de éxito
            if (showSuccessToast && successMessage) {
                toast.success(successMessage);
            }

            // Callback de éxito
            if (onSuccess) {
                onSuccess(result);
            }

            return result;

        } catch (err) {
            console.error('[useApiCall] Error:', err);

            // Extraer mensaje de error del backend
            const backendMessage = err.response?.data?.message || err.response?.data?.error;
            const finalErrorMessage = backendMessage || errorMessage;

            setError(finalErrorMessage);

            // Toast de error
            if (showErrorToast) {
                toast.error(finalErrorMessage, {
                    duration: 5000,
                    position: 'top-right',
                });
            }

            // Logging a Sentry
            captureException(err, {
                context: 'useApiCall',
                apiFunction: apiFunction.name,
                args,
            });

            // Callback de error
            if (onError) {
                onError(err);
            }

            throw err; // Re-throw para que el componente pueda manejarlo si necesita

        } finally {
            setLoading(false);
        }
    }, [apiFunction, successMessage, errorMessage, onSuccess, onError, showSuccessToast, showErrorToast]);

    const reset = useCallback(() => {
        setLoading(false);
        setError(null);
        setData(null);
    }, []);

    return {
        execute,
        loading,
        error,
        data,
        reset,
    };
}
