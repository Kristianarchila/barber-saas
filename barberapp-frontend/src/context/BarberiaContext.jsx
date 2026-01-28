import { createContext, useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { getBarberiaBySlug, getServiciosBySlug, getBarberosBySlug } from "../services/publicService";

export const BarberiaContext = createContext();

/**
 * BarberiaProvider - Provee el contexto de la barbería actual
 * 
 * Lee el slug de la URL y carga automáticamente los datos de la barbería.
 * Provee: slug, barberia, loading, error
 */
export const BarberiaProvider = ({ children }) => {
    const { slug } = useParams();
    const [barberia, setBarberia] = useState(null);
    const [servicios, setServicios] = useState([]);
    const [barberos, setBarberos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            if (!slug) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Usamos Promise.all para cargar todos en paralelo
                const [barberiaData, serviciosData, barberosData] = await Promise.all([
                    getBarberiaBySlug(slug),
                    getServiciosBySlug(slug).catch(() => []),
                    getBarberosBySlug(slug).catch(() => [])
                ]);

                setBarberia(barberiaData);
                setServicios(Array.isArray(serviciosData) ? serviciosData : []);
                setBarberos(Array.isArray(barberosData) ? barberosData : []);
            } catch (err) {
                console.error("Error cargando datos de la barbería:", err);
                setError(err.response?.data?.message || "Error al cargar la plataforma");
                setBarberia(null);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [slug]);

    return (
        <BarberiaContext.Provider value={{ slug, barberia, servicios, barberos, loading, error, setBarberia }}>
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
