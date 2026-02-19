const TransactionManager = require('../../../utils/TransactionManager');

/**
 * Complete Reserva Use Case
 * Handles marking a reservation as completed
 */
class CompleteReserva {
    constructor(reservaRepository, clienteRepository, emailService) {
        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
        this.emailService = emailService;
    }

    /**
     * Execute the use case
     * @param {string} reservaId
     * @param {Object} options - { generateReviewToken: boolean }
     * @returns {Promise<Reserva>}
     */
    async execute(reservaId, options = {}) {
        const { generateReviewToken = true, barberiaId } = options;

        // Execute within transaction for atomicity
        const result = await TransactionManager.executeInTransaction(
            async (session) => {
                // 1. Find the reservation
                const reserva = await this.reservaRepository.findById(reservaId, barberiaId);

                if (!reserva) {
                    const error = new Error('Reserva no encontrada');
                    error.statusCode = 404;
                    throw error;
                }

                // 2. Complete the reservation (domain logic validates state)
                reserva.complete();

                // 3. Generate review token if requested
                const crypto = require('crypto');
                const reviewToken = generateReviewToken
                    ? crypto.randomBytes(32).toString('hex')
                    : null;

                // ✅ NUEVO: Calcular fecha de expiración (30 días)
                const reviewTokenExpiry = reviewToken
                    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
                    : null;

                // 4. Persist the changes (within transaction)
                await this.reservaRepository.update(
                    reserva.id,
                    {
                        estado: reserva.estado,
                        completadaEn: new Date(),
                        reviewToken: reviewToken,
                        reviewTokenExpiry: reviewTokenExpiry, // ✅ NUEVO
                        updatedAt: reserva.updatedAt
                    },
                    null, // barberiaId
                    session // Pass session for transaction
                );

                // 5. Update client visit history if client exists (within transaction)
                if (reserva.clienteId) {
                    try {
                        const cliente = await this.clienteRepository.findById(reserva.clienteId);
                        if (cliente) {
                            cliente.recordVisit();
                            await this.clienteRepository.update(
                                cliente.id,
                                cliente.toObject(),
                                null, // barberiaId
                                session // Pass session for transaction
                            );
                        }
                    } catch (err) {
                        // If client update fails, entire transaction rolls back
                        console.error('Error updating client visit history:', err);
                        throw err; // Re-throw to trigger rollback
                    }
                }

                return { reserva, reviewToken };
            },
            { operationName: 'CompleteReservation' }
        );

        // 6. Send review request email AFTER transaction commits (async, no rollback)
        if (result.reviewToken) {
            this.emailService.sendReviewRequest(result.reserva, result.reviewToken).catch(err => {
                console.error('Error sending review request:', err);
            });
        }

        return result.reserva;
    }
}

module.exports = CompleteReserva;
