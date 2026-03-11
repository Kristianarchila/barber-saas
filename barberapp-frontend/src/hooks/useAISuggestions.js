// === ARCHIVO: hooks/useAISuggestions.js ===
import { useState, useEffect } from "react";
import { getAISuggestions } from "../services/publicService";

export function useAISuggestions({ barberiaId, barberoId, servicioId, fecha, turnosDisponibles, loadingTurnos }) {
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            const noSlots = !loadingTurnos && turnosDisponibles.length === 0;
            const hasContext = fecha && barberoId && servicioId && barberiaId;

            if (noSlots && hasContext) {
                setLoadingAI(true);
                try {
                    const result = await getAISuggestions(barberiaId, barberoId, servicioId, fecha, "12:00");
                    setAiSuggestion(result);
                } catch (error) {
                    console.error("Error fetching AI suggestions:", error);
                } finally {
                    setLoadingAI(false);
                }
            } else if (turnosDisponibles.length > 0) {
                setAiSuggestion(null);
            }
        };

        fetch();
    }, [turnosDisponibles, fecha, barberoId, servicioId, loadingTurnos, barberiaId]);

    return { aiSuggestion, loadingAI };
}
