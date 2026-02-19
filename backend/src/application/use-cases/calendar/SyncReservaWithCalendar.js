/**
 * Sync Reserva With Calendar Use Case
 * Synchronizes a reservation with the barbero's external calendar (Google/Outlook)
 */
class SyncReservaWithCalendar {
    constructor(reservaRepository, calendarSyncRepository, googleAdapter, outlookAdapter) {
        this.reservaRepository = reservaRepository;
        this.calendarSyncRepository = calendarSyncRepository;
        this.googleAdapter = googleAdapter;
        this.outlookAdapter = outlookAdapter;
    }

    /**
     * Execute the use case
     * @param {string} reservaId
     * @param {string} action - 'CREATE', 'UPDATE', 'DELETE'
     */
    async execute(reservaId, action = 'CREATE') {
        // 1. Get reservation details
        const reserva = await this.reservaRepository.findById(reservaId);
        if (!reserva) return;

        // 2. Check if the barber has a calendar connected
        const calendarSync = await this.calendarSyncRepository.findByBarberoId(reserva.barberoId);
        if (!calendarSync || !calendarSync.isActive) return;

        // 3. Prepare adapter and tokens
        let adapter;
        if (calendarSync.provider === 'google') {
            adapter = this.googleAdapter;
        } else if (calendarSync.provider === 'outlook') {
            adapter = this.outlookAdapter;
        }

        if (!adapter) return;

        // 4. Check/Refresh token if needed
        let accessToken = calendarSync.accessToken;
        if (new Date() >= calendarSync.expiryDate) {
            try {
                const newTokens = await adapter.refreshToken(calendarSync.refreshToken);
                calendarSync.accessToken = newTokens.access_token;
                calendarSync.expiryDate = new Date(Date.now() + (newTokens.expires_in * 1000));
                if (newTokens.refresh_token) {
                    calendarSync.refreshToken = newTokens.refresh_token;
                }
                await this.calendarSyncRepository.save(calendarSync);
                accessToken = calendarSync.accessToken;
            } catch (error) {
                console.error(`Error refreshing calendar token for barbero ${reserva.barberoId}:`, error);
                return;
            }
        }

        // 5. Build event data
        const eventData = this.buildEventData(reserva);

        // 6. Perform action
        try {
            if (action === 'DELETE' || reserva.isCancelled()) {
                if (reserva.externalEventId) {
                    await adapter.deleteEvent(accessToken, reserva.externalEventId);
                    reserva.externalEventId = null;
                    await this.reservaRepository.save(reserva);
                }
            } else if (action === 'CREATE' || !reserva.externalEventId) {
                const event = await adapter.createEvent(accessToken, eventData);
                reserva.externalEventId = event.id;
                await this.reservaRepository.save(reserva);
            } else {
                // Update implementation (optional, for now we delete and recreate or just create)
                // To keep it simple for MVP:
                await adapter.deleteEvent(accessToken, reserva.externalEventId);
                const event = await adapter.createEvent(accessToken, eventData);
                reserva.externalEventId = event.id;
                await this.reservaRepository.save(reserva);
            }
        } catch (error) {
            console.error(`Error syncing reservation ${reservaId} with ${calendarSync.provider}:`, error);
        }
    }

    buildEventData(reserva) {
        // This should return an object compatible with both adapters or mapped inside them
        // For simplicity, we assume Google Calendar format and map in adapters if needed
        const start = new Date(reserva.fecha);
        const [h, m] = reserva.timeSlot.hora.split(':').map(Number);
        start.setHours(h, m, 0);

        const end = new Date(start.getTime() + (reserva.servicioDuracion || 30) * 60000);

        return {
            summary: `Cita: ${reserva.clienteNombre}`,
            description: `Servicio: ${reserva.servicioNombre}\nCliente: ${reserva.clienteNombre}\nEmail: ${reserva.clienteEmail || 'N/A'}`,
            start: {
                dateTime: start.toISOString(),
                timeZone: 'UTC'
            },
            end: {
                dateTime: end.toISOString(),
                timeZone: 'UTC'
            }
        };
    }
}

module.exports = SyncReservaWithCalendar;
