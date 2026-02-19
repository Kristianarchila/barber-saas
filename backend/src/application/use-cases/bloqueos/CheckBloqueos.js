/**
 * @file CheckBloqueos.js
 * @description Use case for checking if a date/time is blocked
 */

class CheckBloqueos {
    constructor(bloqueoRepository) {
        this.bloqueoRepository = bloqueoRepository;
    }

    /**
     * Checks if a specific date/time is blocked
     * @param {Object} params
     * @param {string} params.barberiaId
     * @param {Date} params.fecha
     * @param {string} params.hora - Optional, format HH:MM
     * @param {string} params.barberoId - Optional
     * @returns {Promise<Object>} { bloqueado: boolean, bloqueos: Bloqueo[], motivo: string }
     */
    async execute({ barberiaId, fecha, hora = null, barberoId = null }) {
        // Get all active bloqueos for this date
        const bloqueos = await this.bloqueoRepository.findActiveByDate(
            barberiaId,
            fecha,
            barberoId
        );

        // Check if any bloqueo blocks this specific date/time
        const bloqueosActivos = bloqueos.filter(bloqueo => {
            // Check if bloqueo applies to this barbero
            if (!bloqueo.appliesToBarbero(barberoId)) {
                return false;
            }

            // Check if bloqueo blocks this date/time
            return bloqueo.blocksDateTime(fecha, hora);
        });

        if (bloqueosActivos.length > 0) {
            return {
                bloqueado: true,
                bloqueos: bloqueosActivos,
                motivo: bloqueosActivos[0].motivo,
                tipo: bloqueosActivos[0].tipo
            };
        }

        return {
            bloqueado: false,
            bloqueos: [],
            motivo: null,
            tipo: null
        };
    }

    /**
     * Validates if a reservation can be made on a specific date/time
     * Throws error if blocked
     * @param {Object} params
     * @param {string} params.barberiaId
     * @param {Date} params.fecha
     * @param {string} params.hora
     * @param {string} params.barberoId
     * @returns {Promise<void>}
     */
    async validateReservation({ barberiaId, fecha, hora, barberoId }) {
        const result = await this.execute({ barberiaId, fecha, hora, barberoId });

        if (result.bloqueado) {
            const tipoLabel = {
                'VACACIONES': 'Vacaciones',
                'FERIADO': 'Feriado',
                'EMERGENCIA': 'Emergencia',
                'OTRO': 'Bloqueo'
            };

            throw new Error(
                `No se puede reservar en esta fecha/hora. ${tipoLabel[result.tipo]}: ${result.motivo}`
            );
        }
    }
}

module.exports = CheckBloqueos;
