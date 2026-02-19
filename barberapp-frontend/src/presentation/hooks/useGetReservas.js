import { useState, useEffect } from 'react';
import { GetReservas } from '../../application/use-cases/reservas/GetReservas';
import { getReservaRepository } from '../../infrastructure/di/container';
import { ReservaMapper } from '../../infrastructure/mappers/ReservaMapper';

/**
 * Custom Hook: useGetReservas
 * 
 * Hook de presentación que encapsula el use case GetReservas.
 * Maneja el estado de loading, error y datos.
 * Opcionalmente puede cargar datos automáticamente al montar.
 */
export function useGetReservas(filters = {}, autoFetch = false) {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Obtener reservas
     */
    const fetchReservas = async (customFilters = {}) => {
        setLoading(true);
        setError(null);

        try {
            // Obtener repositorio del container
            const repository = getReservaRepository();

            // Crear instancia del use case
            const useCase = new GetReservas(repository);

            // Ejecutar use case con filtros
            const finalFilters = { ...filters, ...customFilters };
            const reservasList = await useCase.execute(finalFilters);

            // Convertir a ViewModels para la UI
            const viewModels = reservasList.map(r => ReservaMapper.toViewModel(r));

            setReservas(viewModels);
            return viewModels;
        } catch (err) {
            const errorMessage = err.message || 'Error al obtener las reservas';
            setError(errorMessage);
            console.error('Error en useGetReservas:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Refrescar reservas (alias de fetchReservas)
     */
    const refresh = () => fetchReservas();

    /**
     * Auto-fetch al montar si está habilitado
     */
    useEffect(() => {
        if (autoFetch) {
            fetchReservas();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        reservas,
        loading,
        error,
        fetchReservas,
        refresh
    };
}
