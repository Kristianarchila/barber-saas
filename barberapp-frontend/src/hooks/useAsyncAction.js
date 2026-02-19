import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { captureException } from '../services/errorTracking';

/**
 * Hook para proteger acciones asíncronas (botones) contra:
 * - Clicks múltiples
 * - Ejecución simultánea
 * - Errores sin feedback
 * 
 * @param {Function} asyncAction - Función async a ejecutar
 * @param {Object} options - Opciones de configuración
 * @param {string} options.successMessage - Mensaje de éxito
 * @param {string} options.errorMessage - Mensaje de error
 * @param {Function} options.onSuccess - Callback en caso de éxito
 * @param {Function} options.onError - Callback en caso de error
 * @param {boolean} options.showSuccessToast - Mostrar toast de éxito (default: true)
 * @param {boolean} options.showErrorToast - Mostrar toast de error (default: true)
 * 
 * @returns {Object} { execute, loading, error }
 * 
 * @example
 * const { execute: completar, loading: completando } = useAsyncAction(
 *   completarReserva,
 *   {
 *     successMessage: 'Reserva completada',
 *     errorMessage: 'Error al completar reserva'
 *   }
 * );
 * 
 * <Button onClick={() => completar(id)} disabled={completando}>
 *   {completando ? 'Completando...' : 'Completar'}
 * </Button>
 */
export function useAsyncAction(asyncAction, options = {}) {
    const {
        successMessage,
        errorMessage = 'Ocurrió un error. Por favor, intenta nuevamente.',
        onSuccess,
        onError,
        showSuccessToast = true,
        showErrorToast = true,
    } = options;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        // Prevenir ejecución múltiple
        if (loading) {
            console.warn('[useAsyncAction] Acción ya en progreso, ignorando click');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const result = await asyncAction(...args);

            // Toast de éxito
            if (showSuccessToast && successMessage) {
                toast.success(successMessage, {
                    duration: 3000,
                    position: 'top-right',
                });
            }

            // Callback de éxito
            if (onSuccess) {
                onSuccess(result);
            }

            return result;

        } catch (err) {
            console.error('[useAsyncAction] Error:', err);

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
                context: 'useAsyncAction',
                action: asyncAction.name,
                args,
            });

            // Callback de error
            if (onError) {
                onError(err);
            }

            throw err;

        } finally {
            setLoading(false);
        }
    }, [loading, asyncAction, successMessage, errorMessage, onSuccess, onError, showSuccessToast, showErrorToast]);

    return {
        execute,
        loading,
        error,
    };
}
