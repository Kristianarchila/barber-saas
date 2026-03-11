// === ARCHIVO: hooks/useAvailability.js ===
import { useState, useEffect } from "react";
import { getDisponibilidadBySlug } from "../services/publicService";

// Singleton cache – vive fuera del hook para persistir entre renders
const availabilityCache = new Map();

export const getCachedDisponibilidad = async (slug, barberoId, fecha, servicioId) => {
    const key = `${slug}|${barberoId}|${fecha}|${servicioId}`;
    if (availabilityCache.has(key)) return availabilityCache.get(key);
    const data = await getDisponibilidadBySlug(slug, barberoId, fecha, servicioId);
    availabilityCache.set(key, data);
    if (availabilityCache.size > 50) {
        const firstKey = availabilityCache.keys().next().value;
        availabilityCache.delete(firstKey);
    }
    return data;
};

export function useAvailability({ slug, barberoId, fecha, servicioId }) {
    const [turnosDisponibles, setTurnosDisponibles] = useState([]);
    const [loadingTurnos, setLoadingTurnos] = useState(false);

    useEffect(() => {
        const abortController = new AbortController();

        const fetchTurnos = async () => {
            const targetBarberId = barberoId === "any" ? "" : barberoId;
            if (!fecha || !servicioId || !slug) return;

            setLoadingTurnos(true);
            setTurnosDisponibles([]);

            try {
                const data = await getCachedDisponibilidad(slug, targetBarberId, fecha, servicioId);
                if (!abortController.signal.aborted) {
                    setTurnosDisponibles(data.turnosDisponibles || []);
                }
            } catch (error) {
                if (!abortController.signal.aborted) {
                    console.error("Error fetching turnos:", error);
                    setTurnosDisponibles([]);
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoadingTurnos(false);
                }
            }
        };

        fetchTurnos();
        return () => { abortController.abort(); };
    }, [fecha, barberoId, servicioId, slug]);

    return { turnosDisponibles, setTurnosDisponibles, loadingTurnos };
}
