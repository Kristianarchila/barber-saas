// === ARCHIVO: hooks/useSmartSuggest.js ===
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { getCachedDisponibilidad } from "./useAvailability";

export function useSmartSuggest({ slug, barberoId, fecha, servicioId, barberos, turnosDisponibles, loadingTurnos }) {
    const [smartSuggest, setSmartSuggest] = useState(null);
    const [loadingSmartSuggest, setLoadingSmartSuggest] = useState(false);

    useEffect(() => {
        const abortController = new AbortController();

        const run = async () => {
            const isSpecificBarber = barberoId && barberoId !== "any";
            const shouldSearch = !loadingTurnos && turnosDisponibles.length === 0 && fecha && isSpecificBarber && slug && servicioId;

            if (!shouldSearch) {
                setSmartSuggest(null);
                return;
            }

            setLoadingSmartSuggest(true);
            try {
                const next7Days = Array.from({ length: 7 }, (_, i) =>
                    dayjs(fecha).add(i + 1, "day").format("YYYY-MM-DD")
                );
                const otherBarbers = barberos.filter(b => b._id !== barberoId);

                const [nextDaysResults, otherBarbersResults] = await Promise.all([
                    Promise.all(
                        next7Days.map(async (d) => {
                            try {
                                const res = await getCachedDisponibilidad(slug, barberoId === "any" ? "" : barberoId, d, servicioId);
                                const t = res.turnosDisponibles || [];
                                return t.length > 0 ? { fecha: d, turnos: t.slice(0, 3) } : null;
                            } catch { return null; }
                        })
                    ),
                    Promise.all(
                        otherBarbers.map(async (barber) => {
                            try {
                                const res = await getCachedDisponibilidad(slug, barber._id, fecha, servicioId);
                                const t = res.turnosDisponibles || [];
                                return t.length > 0 ? { barber, turnos: t.slice(0, 3) } : null;
                            } catch { return null; }
                        })
                    ),
                ]);

                if (!abortController.signal.aborted) {
                    setSmartSuggest({
                        nextDays: nextDaysResults.filter(Boolean).slice(0, 3),
                        otherBarbers: otherBarbersResults.filter(Boolean),
                    });
                }
            } catch (e) {
                console.error("SmartSuggest error:", e);
            } finally {
                if (!abortController.signal.aborted) setLoadingSmartSuggest(false);
            }
        };

        run();
        return () => { abortController.abort(); };
    }, [turnosDisponibles, loadingTurnos, barberoId, fecha, servicioId, slug, barberos]);

    return { smartSuggest, setSmartSuggest, loadingSmartSuggest };
}
