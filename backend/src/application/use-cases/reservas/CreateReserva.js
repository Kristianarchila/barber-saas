const Reserva = require('../../../domain/entities/Reserva');
const crypto = require('crypto');
const TransactionManager = require('../../../utils/TransactionManager');
const { ReservationConflictError, handleDuplicateKeyError } = require('../../../utils/customErrors');

/**
 * Create Reserva Use Case
 * Orchestrates the creation of a new reservation
 */
class CreateReserva {
    constructor(reservaRepository, servicioRepository, availabilityService, emailService, checkBloqueos, checkClienteStatus, incrementReserva, barberoRepository) {
        this.reservaRepository = reservaRepository;
        this.servicioRepository = servicioRepository;
        this.availabilityService = availabilityService;
        this.emailService = emailService;
        this.checkBloqueos = checkBloqueos;
        this.checkClienteStatus = checkClienteStatus;
        this.incrementReserva = incrementReserva;
        this.barberoRepository = barberoRepository;
    }

    /**
     * Execute the use case
     * @param {Object} dto - Data Transfer Object
     * @returns {Promise<Reserva>}
     */
    async execute(dto) {
        try {
            // Execute within transaction to prevent race conditions (double booking)
            const savedReserva = await TransactionManager.executeInTransaction(
                async (session) => {
                    // 1. Validate service belongs to the tenant
                    // NOTE: Past-date validation is intentionally deferred to TimeSlot.isPast()
                    // inside isTimeSlotAvailable(), which uses the correct tenant IANA timezone.
                    // A naive new Date() check here would use the server's TZ, causing false
                    // rejections for tenants in timezones ahead of the server.
                    const servicio = await this.servicioRepository.findById(dto.servicioId, dto.barberiaId);
                    if (!servicio) {
                        throw new Error('Servicio no encontrado');
                    }

                    if (!servicio.isAvailable()) {
                        throw new Error('El servicio no está disponible');
                    }

                    // 3. Validate barbero belongs to this tenant (cross-tenant isolation)
                    if (this.barberoRepository) {
                        const barbero = await this.barberoRepository.findById(dto.barberoId, dto.barberiaId);
                        if (!barbero) {
                            const err = new Error('Barbero no encontrado en esta barbería');
                            err.statusCode = 403;
                            throw err;
                        }
                    }

                    // 3. Check if date/time is blocked (CRITICAL: before availability check)
                    if (this.checkBloqueos) {
                        await this.checkBloqueos.validateReservation({
                            barberiaId: dto.barberiaId,
                            fecha: dto.fecha,
                            hora: dto.hora,
                            barberoId: dto.barberoId
                        });
                    }

                    // 4. Check if client is blocked (cancellation limits)
                    if (this.checkClienteStatus && dto.emailCliente) {
                        await this.checkClienteStatus.execute({
                            email: dto.emailCliente,
                            barberiaId: dto.barberiaId
                        });
                    }

                    // 5. Check availability (CRITICAL: within transaction to prevent race condition)
                    const duracion = servicio.duracion;
                    // timezone comes from DTO — provided by the controller which has the barbería context
                    const tzName = dto.timezone || 'America/Santiago';
                    const isAvailable = await this.availabilityService.isTimeSlotAvailable(
                        dto.barberoId,
                        dto.fecha,
                        dto.hora,
                        duracion,
                        dto.barberiaId,
                        null,
                        tzName
                    );

                    if (!isAvailable) {
                        throw new ReservationConflictError();
                    }

                    // 6. Create domain entity
                    const reserva = new Reserva({
                        barberoId: dto.barberoId,
                        clienteId: dto.clienteId || null,
                        nombreCliente: dto.nombreCliente,
                        emailCliente: dto.emailCliente,
                        barberiaId: dto.barberiaId,
                        servicioId: dto.servicioId,
                        fecha: dto.fecha,
                        hora: dto.hora,
                        duracion: duracion,
                        precio: servicio.precio.amount,
                        timezone: tzName,
                        cancelToken: crypto.randomBytes(32).toString('hex'),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });

                    // 7. Persist the reservation (within transaction)
                    // This locks the time slot, preventing concurrent bookings
                    // The unique index will throw duplicate key error if conflict occurs
                    const savedReserva = await this.reservaRepository.save(reserva, session);

                    return savedReserva;
                },
                { operationName: 'CreateReservation' }
            );

            // 8. Send confirmation email AFTER transaction commits (async, no rollback)
            this.emailService.sendReservaConfirmation(savedReserva).catch(err => {
                console.error('Error sending confirmation email:', err);
            });

            // 9. Increment reservation counter (async, no rollback)
            if (this.incrementReserva && dto.emailCliente) {
                this.incrementReserva.execute({
                    email: dto.emailCliente,
                    barberiaId: dto.barberiaId,
                    telefono: dto.telefonoCliente
                }).catch(err => {
                    console.error('Error incrementing reservation counter:', err);
                });
            }

            return savedReserva;
        } catch (error) {
            // Convert MongoDB duplicate key errors to user-friendly messages
            throw handleDuplicateKeyError(error);
        }
    }
}

module.exports = CreateReserva;
