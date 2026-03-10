const events = require('../../events');
const emailService = require('../../notifications/email/email.service');
const logger = require('../../config/logger');

/**
 * AlertService
 * 
 * Escucha eventos críticos del sistema y notifica al SuperAdmin
 * de forma proactiva (Email, Webhooks, etc.)
 */
class AlertService {
    constructor() {
        this.initializeListeners();
    }

    initializeListeners() {
        // Escuchar alertas críticas
        events.on('alert:critical', async (alertData) => {
            await this.handleCriticalAlert(alertData);
        });

        // Escuchar intentos de cross-tenant
        events.on('security:cross-tenant', async (data) => {
            await this.handleSecurityAlert('INTENTO DE ACCESO CROSS-TENANT', data);
        });

        logger.info('AlertService inicializado y escuchando eventos críticos');
    }

    async handleCriticalAlert(data) {
        try {
            const { action, message, severity, userId, barberiaId } = data;

            logger.error(`🚨 ALERTA CRÍTICA RECIBIDA: ${action}`, data);

            // Solo enviar email si es CRITICAL o HIGH
            if (severity === 'CRITICAL' || severity === 'HIGH') {
                const adminEmail = process.env.ADMIN_ALERT_EMAIL || process.env.EMAIL_USER;

                await emailService.sendMail({
                    to: adminEmail,
                    subject: `🚨 ALERTA DE SISTEMA: ${action}`,
                    text: `
                        Se ha detectado un evento de severidad ${severity}.
                        
                        Mensaje: ${message}
                        Acción: ${action}
                        Usuario ID: ${userId || 'N/A'}
                        Barbería ID: ${barberiaId || 'N/A'}
                        Timestamp: ${new Date().toISOString()}
                        
                        Por favor, revise los logs del sistema para más detalles.
                    `,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 2px solid #ef4444; border-radius: 8px;">
                            <h2 style="color: #ef4444; margin-top: 0;">🚨 Alerta Crítica de Sistema</h2>
                            <p><strong>Evento:</strong> ${action}</p>
                            <p><strong>Severidad:</strong> <span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px;">${severity}</span></p>
                            <p><strong>Mensaje:</strong> ${message}</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="font-size: 12px; color: #666;">
                                Usuario: ${userId || 'Sistema'}<br>
                                Barbería: ${barberiaId || 'N/A'}<br>
                                IP: ${data.request?.ip || 'Desconocida'}
                            </p>
                        </div>
                    `
                });
            }
        } catch (error) {
            logger.error('Error al procesar alerta crítica:', error);
        }
    }

    async handleSecurityAlert(title, data) {
        // Formatear alerta de seguridad específica
        const alertData = {
            action: title,
            severity: 'CRITICAL',
            message: `Intento sospechoso detectado: ${data.message || 'Sin descripción'}`,
            ...data
        };
        await this.handleCriticalAlert(alertData);
    }
}

module.exports = new AlertService();
