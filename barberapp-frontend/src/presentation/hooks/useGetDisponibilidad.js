import { useState } from 'react';
import { GetDisponibilidadBarbero } from '../../application/use-cases/barberos/GetDisponibilidadBarbero';

/**
 * Custom Hook: useGetDisponibilidad
 * 
 * Hook de presentación para obtener la disponibilidad de un barbero.
 */
export function useGetDisponibilidad() {
    const [disponibilidad, setDisponibilidad] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Obtener disponibilidad de un barbero
     */
    const fetchDisponibilidad = async (barberoId, fecha) => {
        setLoading(true);
        setError(null);
        setDisponibilidad(null);

        try {
            // Obtener repositorio del container
            const { container } = await import('../../infrastructure/di/container');
            const repository = container.get('barberoRepository');

            // Crear instancia del use case
            const useCase = new GetDisponibilidadBarbero(repository);

            // Ejecutar use case
            const result = await useCase.execute(barberoId, fecha);

            setDisponibilidad(result);
            return result;
        } catch (err) {
            const errorMessage = err.message || 'Error al obtener disponibilidad';
            setError(errorMessage);
            console.error('Error en useGetDisponibilidad:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Resetear el estado
     */
    const reset = () => {
        setDisponibilidad(null);
        setError(null);
    };

    return {
        disponibilidad,
        loading,
        error,
        fetchDisponibilidad,
        reset
    };
}
