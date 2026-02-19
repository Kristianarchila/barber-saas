const TransactionManager = require('../../../utils/TransactionManager');
const AuditHelper = require('../../../utils/AuditHelper');

/**
 * Cancel Reserva Use Case
 * Handles the cancellation of a reservation
 */
class CancelReserva {
    constructor(reservaRepository, emailService, barberiaRepository, validarCancelacion, incrementCancelacion) {
        this.reservaRepository = reservaRepository;

        this.emailService = emailService;
        this.barberiaRepository = barberiaRepository;
        this.validarCancelacion = validarCancelacion;
        this.incrementCancelacion = incrementCancelacion;
    }

    /**
     * Execute the use case
     * @param {string} reservaId
     * @param {string} userId - User requesting the cancellation
     * @param {boolean} isAdmin - Whether the user is an admin
     * @param {Object} request - Express request object for audit
     * @returns {Promise<Reserva>}
     */
    async execute(reservaId, userId, isAdmin = false, barberiaId = null, request = null) {
        // Execute within transaction
        const reserva = await TransactionManager.executeInTransaction(
            async (session) => {
                // 1. Find the reservation
                const reserva = await this.reservaRepository.findById(reservaId, barberiaId);

                if (!reserva) {
                    const error = new Error('Reserva no encontrada');
                    error.statusCode = 404;
                    throw error;
                }

                // 2. Validate permissions
                // Only the client or an admin can cancel
                if (!isAdmin && reserva.clienteId && reserva.clienteId !== userId) {
                    throw new Error('No tienes permisos para cancelar esta reserva');
                }

                // 3. Validate cancellation time limits (if not admin)
                if (!isAdmin && this.validarCancelacion && this.barberiaRepository) {
                    const barberia = await this.barberiaRepository.findById(reserva.barberiaId);
                    if (barberia && barberia.politicasCancelacion) {
                        await this.validarCancelacion.execute({
                            reserva,
                            politicas: barberia.politicasCancelacion,
                            isAdmin
                        });
                    }
                }

                // Guardar estado anterior para auditoría
                const reservaSnapshot = {
                    estado: reserva.estado,
                    nombreCliente: reserva.nombreCliente,
                    emailCliente: reserva.emailCliente,
                    fecha: reserva.fecha,
                    hora: reserva.hora
                };

                // 4. Cancel the reservation (domain logic)
                reserva.cancel();

                // 5. Persist the change (within transaction)
                await this.reservaRepository.update(
                    reserva.id,
                    {
                        estado: reserva.estado,
                        updatedAt: reserva.updatedAt
                    },
                    null, // barberiaId
                    session // Pass session for transaction
                );

                // 6. 📝 AUDITAR - Registrar cancelación
                if (userId) {
                    await AuditHelper.logCancelReserva({
                        userId,
                        barberiaId: reserva.barberiaId,
                        reservaId: reserva.id,
                        reservaData: reservaSnapshot,
                        isAdmin,
                        request: request ? AuditHelper.extractRequestInfo(request) : {}
                    });
                }

                return reserva;
            },
            { operationName: 'CancelReservation' }
        );

        // 7. Send cancellation notification AFTER transaction commits (async, no rollback)
        this.emailService.sendCancellationNotification(reserva).catch(err => {
            console.error('Error sending cancellation email:', err);
        });

        // 8. Increment cancellation counter (if not admin)
        if (!isAdmin && this.incrementCancelacion && reserva.emailCliente) {
            const barberia = await this.barberiaRepository.findById(reserva.barberiaId);
            if (barberia) {
                this.incrementCancelacion.execute({
                    email: reserva.emailCliente,
                    barberiaId: reserva.barberiaId,
                    politicas: barberia.politicasCancelacion || {}
                }).catch(err => {
                    console.error('Error incrementing cancellation counter:', err);
                });
            }
        }

        return reserva;
    }

    /**
     * Cancel by token (public cancellation link)
     * @param {string} cancelToken
     * @returns {Promise<Reserva>}
     */
    async executeByToken(cancelToken) {
        // Execute within transaction
        const reserva = await TransactionManager.executeInTransaction(
            async (session) => {
                // 1. Find reservation by token
                const reserva = await this.reservaRepository.findByCancelToken(cancelToken);

                if (!reserva) {
                    throw new Error('Reserva no encontrada o token inválido');
                }

                // 2. Validate cancellation time limits (public cancellation)
                if (this.validarCancelacion && this.barberiaRepository) {
                    const barberia = await this.barberiaRepository.findById(reserva.barberiaId);
                    if (barberia && barberia.politicasCancelacion) {
                        await this.validarCancelacion.execute({
                            reserva,
                            politicas: barberia.politicasCancelacion,
                            isAdmin: false
                        });
                    }
                }

                // 3. Cancel the reservation
                reserva.cancel();

                // 3. Persist (within transaction)
                await this.reservaRepository.update(
                    reserva.id,
                    {
                        estado: reserva.estado,
                        updatedAt: reserva.updatedAt
                    },
                    null, // barberiaId
                    session // Pass session for transaction
                );

                return reserva;
            },
            { operationName: 'CancelReservationByToken' }
        );

        // 4. Send notification AFTER transaction commits
        this.emailService.sendCancellationNotification(reserva).catch(err => {
            console.error('Error sending cancellation email:', err);
        });

        // 5. Increment cancellation counter (public cancellation)
        if (this.incrementCancelacion && reserva.emailCliente) {
            const barberia = await this.barberiaRepository.findById(reserva.barberiaId);
            if (barberia) {
                this.incrementCancelacion.execute({
                    email: reserva.emailCliente,
                    barberiaId: reserva.barberiaId,
                    politicas: barberia.politicasCancelacion || {}
                }).catch(err => {
                    console.error('Error incrementing cancellation counter:', err);
                });
            }
        }

        return reserva;
    }
}

module.exports = CancelReserva;
