const dayjs = require('dayjs');

/**
 * Get AI Slot Suggestions Use Case
 * Suggests alternative time slots when the preferred one is unavailable
 */
class GetAISlotSuggestions {
    constructor(aiAdapter, availabilityService, barberoRepository, servicioRepository, barberiaRepository) {
        this.aiAdapter = aiAdapter;
        this.availabilityService = availabilityService;
        this.barberoRepository = barberoRepository;
        this.servicioRepository = servicioRepository;
        this.barberiaRepository = barberiaRepository;
    }

    /**
     * Execute the use case
     * @param {Object} data - { barberiaId, barberoId, servicioId, fechaDeseada, horaDeseada }
     */
    async execute(data) {
        const { barberiaId, barberoId, servicioId, fechaDeseada, horaDeseada } = data;

        // 1. Fetch context data
        const [barbero, servicio, barberia] = await Promise.all([
            this.barberoRepository.findById(barberoId, barberiaId),
            this.servicioRepository.findById(servicioId),
            this.barberiaRepository.findById(barberiaId)
        ]);

        if (!barbero || !servicio) {
            throw new Error('Barbero o Servicio no encontrado');
        }

        // 2. Search availability for the next 7 days
        const startDate = dayjs(fechaDeseada);
        const suggestions = [];

        // We look for up to 3 alternative slots in the next 7 days
        for (let i = 0; i < 7 && suggestions.length < 3; i++) {
            const currentFecha = startDate.add(i, 'day').format('YYYY-MM-DD');

            // Get slots for this day
            const slots = await this.availabilityService.getAvailableSlots(
                barberoId,
                currentFecha,
                servicio.duracion,
                null, // AvailabilityService will fetch schedule
                barberiaId
            );

            if (slots.length > 0) {
                // Pick one or two slots from this day
                // Prioritize similar time to horaDeseada if possible
                const bestSlots = this.rankSlots(slots, horaDeseada);

                bestSlots.slice(0, 2).forEach(slot => {
                    if (suggestions.length < 3) {
                        suggestions.push({
                            fecha: currentFecha,
                            hora: slot,
                            diaLabel: dayjs(currentFecha).locale('es').format('dddd D [de] MMMM')
                        });
                    }
                });
            }
        }

        if (suggestions.length === 0) {
            return {
                text: "Lo sentimos, parece que no hay disponibilidad próxima. ¡Recomendamos unirse a la lista de espera!",
                slots: []
            };
        }

        // 3. Generate conversational text using AI
        const prompt = this.buildPrompt(barberia, barbero, servicio, fechaDeseada, horaDeseada, suggestions);

        let aiText = null;
        try {
            aiText = await this.aiAdapter.generateChatCompletion([
                {
                    role: 'system',
                    content: 'Eres un asistente experto en atención al cliente para una barbería de lujo y moderna. Tu objetivo es ser amable, profesional y persuasivo para ayudar al cliente a elegir una alternativa.'
                },
                { role: 'user', content: prompt }
            ]);
        } catch (error) {
            console.error('Error generating AI text, falling back to default:', error);
            aiText = `¡Hola! Vemos que buscas a ${barbero.nombre} para ${servicio.nombre}. No tenemos ese hueco, pero aquí tienes unas excelentes alternativas:`;
        }

        return {
            text: aiText || `No encontramos el hueco exacto, pero ${barbero.nombre} tiene estos espacios disponibles:`,
            slots: suggestions
        };
    }

    /**
     * Rank slots based on proximity to desired time
     */
    rankSlots(slots, desiredTime) {
        if (!desiredTime) return slots;

        const desiredMin = this.timeToMinutes(desiredTime);

        return slots.sort((a, b) => {
            const diffA = Math.abs(this.timeToMinutes(a) - desiredMin);
            const diffB = Math.abs(this.timeToMinutes(b) - desiredMin);
            return diffA - diffB;
        });
    }

    timeToMinutes(timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    }

    buildPrompt(barberia, barbero, servicio, fecha, hora, suggestions) {
        const slotsStr = suggestions.map(s => `- ${s.diaLabel} a las ${s.hora}`).join('\n');

        return `
            Contexto:
            - Barbería: ${barberia.nombre}
            - Barbero: ${barbero.nombre}
            - Servicio: ${servicio.nombre}
            - El cliente buscaba: ${fecha} a las ${hora} (pero no está disponible).
            
            Opciones disponibles encontradas:
            ${slotsStr}
            
            Tarea: Saluda al cliente y sugiere estas opciones de forma amigable y elegante. 
            Menciona que ${barbero.nombre} es muy solicitado pero que estos huecos son ideales para su ${servicio.nombre}. 
            Mantén el texto breve (máximo 3-4 frases). No incluyas links, solo el texto persuasivo.
        `;
    }
}

module.exports = GetAISlotSuggestions;
