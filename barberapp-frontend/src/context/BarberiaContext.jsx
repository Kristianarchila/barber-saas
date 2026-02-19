import { createContext, useMemo, useContext } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBarberiaBySlug, getServiciosBySlug, getBarberosBySlug, getResenasBySlug } from "../services/publicService";

export const BarberiaContext = createContext();

/**
 * BarberiaProvider - Provee el contexto de la barbería actual con caché optimizado
 * 
 * Lee el slug de la URL y carga automáticamente los datos de la barbería.
 * Usa React Query para caché automático (5 minutos de datos frescos).
 * Provee: slug, barberia, servicios, barberos, resenas, loading, error
 */
export const BarberiaProvider = ({ children }) => {
    const params = useParams();
    const location = useLocation();

    // Extraer el slug del pathname
    const pathSegments = location.pathname.split('/').filter(Boolean);
    let slug = params.slug || pathSegments[0];

    // Si el primer segmento es alguna ruta especial, no es un slug
    const specialRoutes = ['superadmin', 'login'];
    if (specialRoutes.includes(pathSegments[0])) {
        slug = null;
    }

    // React Query: Barberia data con caché automático
    const { data: barberia, isLoading: loadingBarberia, error: errorBarberia } = useQuery({
        queryKey: ['barberia', slug],
        queryFn: () => getBarberiaBySlug(slug),
        enabled: !!slug, // Solo ejecutar si hay slug
    });

    // React Query: Servicios con caché
    const { data: servicios = [] } = useQuery({
        queryKey: ['servicios', slug],
        queryFn: () => getServiciosBySlug(slug),
        enabled: !!slug,
    });

    // React Query: Barberos con caché
    const { data: barberos = [] } = useQuery({
        queryKey: ['barberos', slug],
        queryFn: () => getBarberosBySlug(slug),
        enabled: !!slug,
    });

    // React Query: Reseñas con caché
    const { data: resenasData } = useQuery({
        queryKey: ['resenas', slug],
        queryFn: () => getResenasBySlug(slug),
        enabled: !!slug,
    });

    // Memoizar valores derivados para evitar re-renders
    const resenas = useMemo(() => resenasData?.data?.resenas || [], [resenasData]);
    const loading = loadingBarberia;
    const error = errorBarberia?.response?.data?.message || errorBarberia?.message;

    // Memoizar el valor del contexto
    const contextValue = useMemo(() => ({
        slug,
        barberia,
        servicios: Array.isArray(servicios) ? servicios : [],
        barberos: Array.isArray(barberos) ? barberos : [],
        resenas,
        loading,
        error,
    }), [slug, barberia, servicios, barberos, resenas, loading, error]);

    return (
        <BarberiaContext.Provider value={contextValue}>
            {children}
        </BarberiaContext.Provider>
    );
};

/**
 * useBarberia - Hook personalizado para acceder al contexto de barbería
 * 
 * Uso:
 * const { slug, barberia, loading, error } = useBarberia();
 */
export const useBarberia = () => {
    const context = useContext(BarberiaContext);
    if (!context) {
        throw new Error("useBarberia debe usarse dentro de BarberiaProvider");
    }
    return context;
};
