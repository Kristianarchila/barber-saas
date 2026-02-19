/**
 * @file IncrementCancelacion.js
 * @description Use case for incrementing cancellation counter and blocking if limit exceeded
 */

class IncrementCancelacion {
    constructor(clienteStatsRepository) {
        this.clienteStatsRepository = clienteStatsRepository;
    }

    /**
     * Increments cancellation counter and checks if client should be blocked
     * @param {Object} params
     * @param {string} params.email - Client email
     * @param {string} params.barberiaId - Barberia ID
     * @param {Object} params.politicas - Cancellation policies
     * @returns {Promise<Object>} Result with stats and blocking info
     */
    async execute({ email, barberiaId, politicas }) {
        if (!email || !barberiaId) {
            throw new Error('Email y barberiaId son requeridos');
        }

        // Increment cancellation counter
        const clienteStats = await this.clienteStatsRepository.incrementCancelacion(
            email,
            barberiaId
        );

        // Check if policies are enabled
        if (!politicas || !politicas.enabled) {
            return {
                stats: clienteStats.getDetails(),
                bloqueado: false,
                excedioLimite: false
            };
        }

        // Check if client has exceeded limit
        const excedioLimite = clienteStats.hasExceededLimit(politicas.maxCancelacionesPorMes);
        const cercaDelLimite = clienteStats.isApproachingLimit(politicas.maxCancelacionesPorMes);

        let bloqueado = false;

        // Block client if exceeded limit and policy is enabled
        if (excedioLimite && politicas.bloquearTrasExceder) {
            const motivo = politicas.mensajeBloqueo ||
                `Excedió el límite de ${politicas.maxCancelacionesPorMes} cancelaciones por mes`;

            await this.clienteStatsRepository.bloquear(
                email,
                barberiaId,
                motivo,
                politicas.diasBloqueo || 30
            );

            bloqueado = true;
        }

        // Get updated stats
        const updatedStats = await this.clienteStatsRepository.findByEmail(email, barberiaId);

        return {
            stats: updatedStats.getDetails(),
            bloqueado,
            excedioLimite,
            cercaDelLimite,
            cancelacionesRestantes: Math.max(0, politicas.maxCancelacionesPorMes - clienteStats.cancelacionesEsteMes),
            mensaje: this._getMensaje(clienteStats, politicas, excedioLimite, cercaDelLimite, bloqueado)
        };
    }

    /**
     * Generates appropriate message based on cancellation status
     * @private
     */
    _getMensaje(clienteStats, politicas, excedioLimite, cercaDelLimite, bloqueado) {
        if (bloqueado) {
            return `Has sido bloqueado por exceder el límite de ${politicas.maxCancelacionesPorMes} cancelaciones. No podrás realizar reservas durante ${politicas.diasBloqueo} días.`;
        }

        if (excedioLimite && !politicas.bloquearTrasExceder) {
            return `Has excedido el límite de ${politicas.maxCancelacionesPorMes} cancelaciones este mes. Por favor, evita cancelar futuras reservas.`;
        }

        if (cercaDelLimite) {
            const restantes = politicas.maxCancelacionesPorMes - clienteStats.cancelacionesEsteMes;
            return `Atención: Solo te quedan ${restantes} cancelación(es) disponible(s) este mes.`;
        }

        const restantes = politicas.maxCancelacionesPorMes - clienteStats.cancelacionesEsteMes;
        return `Cancelación registrada. Te quedan ${restantes} cancelación(es) disponible(s) este mes.`;
    }
}

module.exports = IncrementCancelacion;
