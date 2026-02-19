import { useState, useEffect } from 'react';
import { GetBarberos } from '../../application/use-cases/barberos/GetBarberos';
import { BarberoMapper } from '../../infrastructure/mappers/BarberoMapper';

/**
 * Custom Hook: useGetBarberos
 * 
 * Hook de presentación que encapsula el use case GetBarberos.
 */
export function useGetBarberos(filters = {}, autoFetch = false) {
    const [barberos, setBarberos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Obtener barberos
     */
    const fetchBarberos = async (customFilters = {}) => {
        setLoading(true);
        setError(null);

        try {
            // Obtener repositorio del container
            const { container } = await import('../../infrastructure/di/container');
            const repository = container.get('barberoRepository');

            // Crear instancia del use case
            const useCase = new GetBarberos(repository);

            // Ejecutar use case con filtros
            const finalFilters = { ...filters, ...customFilters };
            const barberosList = await useCase.execute(finalFilters);

            // Convertir a ViewModels para la UI
            const viewModels = BarberoMapper.toViewModelList(barberosList);

            setBarberos(viewModels);
            return viewModels;
        } catch (err) {
            const errorMessage = err.message || 'Error al obtener los barberos';
            setError(errorMessage);
            console.error('Error en useGetBarberos:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Refrescar barberos (alias de fetchBarberos)
     */
    const refresh = () => fetchBarberos();

    /**
     * Filtrar barberos solo activos
     */
    const getActiveBarberos = () => {
        return barberos.filter(b => b.estaActivo);
    };

    /**
     * Filtrar barberos por servicio
     */
    const getBarberosByServicio = (servicioId) => {
        return barberos.filter(b =>
            b.servicios.some(s => s.id === servicioId || s === servicioId)
        );
    };

    /**
     * Auto-fetch al montar si está habilitado
     */
    useEffect(() => {
        if (autoFetch) {
            fetchBarberos();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        barberos,
        loading,
        error,
        fetchBarberos,
        refresh,
        getActiveBarberos,
        getBarberosByServicio
    };
}
