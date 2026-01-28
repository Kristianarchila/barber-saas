import { useState, useEffect } from "react";
import api from "../services/api";

export const useBarberia = (slug) => {
    const [barberia, setBarberia] = useState(null);
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!slug) return;
            try {
                setLoading(true);
                // Fetch both in parallel for better performance
                const [barberiaRes, serviciosRes] = await Promise.all([
                    api.get(`/public/${slug}`),
                    api.get(`/public/${slug}/servicios`)
                ]);

                setBarberia(barberiaRes.data);
                setServicios(serviciosRes.data);
            } catch (err) {
                console.error("Error fetching public barberia data:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    return { barberia, servicios, loading, error };
};
