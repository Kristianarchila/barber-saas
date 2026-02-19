/**
 * Resilient Email Service Wrapper
 * 
 * Envuelve las operaciones de email con circuit breaker,
 * retry logic y graceful degradation.
 */

const CircuitBreaker = require('../utils/circuitBreaker');
const { retryExternalService } = require('../utils/retry');
const Logger = require('../shared/Logger');

// Circuit breaker para Email Service
const emailBreaker = new CircuitBreaker({
    name: 'EmailService',
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000, // 1 minuto
    fallback: (emailData) => {
        Logger.warn('EmailService', 'Circuit breaker OPEN - Email no enviado', {
            to: emailData?.emailCliente,
            type: emailData?.type || 'unknown'
        });
        // No lanzar error, solo loguear
        return { sent: false, reason: 'circuit_breaker_open' };
    }
});

/**
 * Enviar email con resiliencia
 * IMPORTANTE: Los emails NO son críticos, si fallan no debe caer la aplicación
 */
async function sendEmailSafe(emailFunction, emailData, emailType = 'generic') {
    try {
        return await emailBreaker.execute(async () => {
            return await retryExternalService(
                () => emailFunction(emailData),
                `Email ${emailType}`
            );
        }, emailData);
    } catch (error) {
        // GRACEFUL DEGRADATION: Loguear pero NO lanzar error
        Logger.warn('EmailService', `Email ${emailType} falló - Operación continúa`, error, {
            to: emailData?.emailCliente,
            circuitState: emailBreaker.getState()
        });

        // Retornar objeto indicando fallo sin romper el flujo
        return { sent: false, error: error.message };
    }
}

/**
 * Wrapper para el servicio de email existente
 */
class ResilientEmailService {
    constructor(baseEmailService) {
        this.baseService = baseEmailService;
    }

    async reservaConfirmada(data) {
        return sendEmailSafe(
            (d) => this.baseService.reservaConfirmada(d),
            data,
            'reserva_confirmada'
        );
    }

    async reservaCancelada(data) {
        return sendEmailSafe(
            (d) => this.baseService.reservaCancelada(d),
            data,
            'reserva_cancelada'
        );
    }

    async reservaReagendada(data) {
        return sendEmailSafe(
            (d) => this.baseService.reservaReagendada(d),
            data,
            'reserva_reagendada'
        );
    }

    async recordatorioReserva(data) {
        return sendEmailSafe(
            (d) => this.baseService.recordatorioReserva(d),
            data,
            'recordatorio'
        );
    }

    async solicitarResena(data) {
        return sendEmailSafe(
            (d) => this.baseService.solicitarResena(d),
            data,
            'solicitar_resena'
        );
    }

    async notificarNuevaReserva(data) {
        return sendEmailSafe(
            (d) => this.baseService.notificarNuevaReserva(d),
            data,
            'nueva_reserva_admin'
        );
    }

    async sendWelcomePendingEmail(data) {
        return sendEmailSafe(
            (d) => this.baseService.sendWelcomePendingEmail(d),
            data,
            'welcome_pending'
        );
    }

    async sendAccountApprovedEmail(data) {
        return sendEmailSafe(
            (d) => this.baseService.sendAccountApprovedEmail(d),
            data,
            'account_approved'
        );
    }

    /**
     * Obtener estado del circuit breaker
     */
    getServiceStatus() {
        return emailBreaker.getState();
    }

    /**
     * Resetear circuit breaker manualmente
     */
    resetCircuitBreaker() {
        emailBreaker.reset();
        Logger.info('EmailService', 'Circuit breaker reseteado manualmente');
    }
}

module.exports = ResilientEmailService;
