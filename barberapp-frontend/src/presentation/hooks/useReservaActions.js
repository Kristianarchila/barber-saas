import { useState } from 'react';
import { CancelReserva } from '../../application/use-cases/reservas/CancelReserva';
import { CompleteReserva } from '../../application/use-cases/reservas/CompleteReserva';
import { getReservaRepository } from '../../infrastructure/di/container';
import { ReservaMapper } from '../../infrastructure/mappers/ReservaMapper';

/**
 * Custom Hook: useReservaActions
 * 
 * Hook de presentación que encapsula las acciones sobre reservas
 * (cancelar, completar, etc.)
 */
export function useReservaActions() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Cancelar una reserva
     */
    const cancelReserva = async (id) => {
        setLoading(true);
        setError(null);

        try {
            const repository = getReservaRepository();
            const useCase = new CancelReserva(repository);

            const reserva = await useCase.execute(id);
            const viewModel = ReservaMapper.toViewModel(reserva);

            return viewModel;
        } catch (err) {
            const errorMessage = err.message || 'Error al cancelar la reserva';
            setError(errorMessage);
            console.error('Error en cancelReserva:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Completar una reserva
     */
    const completeReserva = async (id) => {
        setLoading(true);
        setError(null);

        try {
            const repository = getReservaRepository();
            const useCase = new CompleteReserva(repository);

            const reserva = await useCase.execute(id);
            const viewModel = ReservaMapper.toViewModel(reserva);

            return viewModel;
        } catch (err) {
            const errorMessage = err.message || 'Error al completar la reserva';
            setError(errorMessage);
            console.error('Error en completeReserva:', err);
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
    };

    return {
        cancelReserva,
        completeReserva,
        loading,
        error,
        reset
    };
}
