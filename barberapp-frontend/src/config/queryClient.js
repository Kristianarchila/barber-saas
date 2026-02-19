import { QueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

/**
 * React Query Client Configuration
 * 
 * Configuración optimizada para caché de API:
 * - staleTime: 5 minutos - Los datos se consideran frescos por 5 min
 * - cacheTime: 10 minutos - Los datos permanecen en caché por 10 min
 * - retry: Reintentos inteligentes con backoff exponencial
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Datos frescos por 5 minutos (no refetch automático)
            staleTime: 5 * 60 * 1000,

            // Mantener en caché por 10 minutos
            gcTime: 10 * 60 * 1000,

            // Reintentar con lógica inteligente
            retry: (failureCount, error) => {
                // No reintentar en errores 4xx (excepto 408 timeout)
                if (error?.response?.status >= 400 && error?.response?.status < 500) {
                    if (error.response.status === 408) return failureCount < 2;
                    return false;
                }
                // Reintentar hasta 3 veces en errores 5xx o de red
                return failureCount < 3;
            },

            // Delay entre reintentos (backoff exponencial)
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // No refetch automático en estas situaciones
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,

            // Error handler global
            onError: (error) => {
                console.error('[React Query] Error:', error);

                // Solo mostrar toast si no es un 401 (ya lo maneja el interceptor)
                if (error?.response?.status !== 401) {
                    const message = error?.response?.data?.message ||
                        error?.response?.data?.error ||
                        'Error al cargar los datos';

                    // No mostrar toast para errores 404 (dejar que el componente lo maneje)
                    if (error?.response?.status !== 404) {
                        toast.error(message, { duration: 4000 });
                    }
                }
            },
        },
        mutations: {
            // Error handler para mutations
            onError: (error) => {
                console.error('[React Query Mutation] Error:', error);

                const message = error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    'Error al procesar la solicitud';

                if (error?.response?.status !== 401) {
                    toast.error(message, { duration: 5000 });
                }
            },
        },
    },
});
