import { useState } from 'react';
import { CreateReserva } from '../../application/use-cases/reservas/CreateReserva';
import { getReservaRepository } from '../../infrastructure/di/container';
import { ReservaMapper } from '../../infrastructure/mappers/ReservaMapper';

/**
 * Custom Hook: useCreateReserva
 * 
 * Hook de presentación que encapsula el use case CreateReserva.
 * Maneja el estado de loading, error y success.
 */
export function useCreateReserva() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    /**
     * Crear una nueva reserva
     */
    const createReserva = async (data) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Obtener repositorio del container
            const repository = getReservaRepository();

            // Crear instancia del use case
            const useCase = new CreateReserva(repository);

            // Ejecutar use case
            const reserva = await useCase.execute(data);

            // Convertir a ViewModel para la UI
            const viewModel = ReservaMapper.toViewModel(reserva);

            setSuccess(true);
            return viewModel;
        } catch (err) {
            const errorMessage = err.message || 'Error al crear la reserva';
            setError(errorMessage);
            console.error('Error en useCreateReserva:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Resetear el estado
     */
    const reset = () => {
        setError(null);
        setSuccess(false);
    };

    return {
        createReserva,
        loading,
        error,
        success,
        reset
    };
}
