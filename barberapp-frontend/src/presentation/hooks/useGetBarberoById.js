import { useState } from 'react';
import { GetBarberoById } from '../../application/use-cases/barberos/GetBarberoById';
import { BarberoMapper } from '../../infrastructure/mappers/BarberoMapper';

/**
 * Custom Hook: useGetBarberoById
 * 
 * Hook de presentación para obtener un barbero específico por ID.
 */
export function useGetBarberoById() {
    const [barbero, setBarbero] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Obtener barbero por ID
     */
    const fetchBarbero = async (id) => {
        setLoading(true);
        setError(null);
        setBarbero(null);

        try {
            // Obtener repositorio del container
            const { container } = await import('../../infrastructure/di/container');
            const repository = container.get('barberoRepository');

            // Crear instancia del use case
            const useCase = new GetBarberoById(repository);

            // Ejecutar use case
            const barberoEntity = await useCase.execute(id);

            // Convertir a ViewModel para la UI
            const viewModel = BarberoMapper.toViewModel(barberoEntity);

            setBarbero(viewModel);
            return viewModel;
        } catch (err) {
            const errorMessage = err.message || 'Error al obtener el barbero';
            setError(errorMessage);
            console.error('Error en useGetBarberoById:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Resetear el estado
     */
    const reset = () => {
        setBarbero(null);
        setError(null);
    };

    return {
        barbero,
        loading,
        error,
        fetchBarbero,
        reset
    };
}
