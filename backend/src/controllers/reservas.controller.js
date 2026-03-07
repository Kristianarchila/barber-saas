/**
 * Reservas Controller (Hexagonal Architecture Version)
 * This controller acts as an adapter in the interfaces layer
 * It delegates business logic to use cases
 */

const container = require('../shared/Container');
const cacheService = require('../infrastructure/cache/CacheService');

// Single-flight registry for calendario (prevents stampede on cold cache)
const calendarInflight = Object.create(null);
const CALENDARIO_TTL = 30; // 30s — calendar changes on new reservations, short TTL ok

/**
 * Fetch the barbería's IANA timezone from DB.
 * Uses a lean, projection-only query to avoid loading the full document.
 * Falls back to 'America/Santiago' if the document has no timezone yet
 * (backwards compatibility with pre-migration records).
 *
 * @param {string} barberiaId
 * @returns {Promise<string>} IANA timezone string
 */
async function resolveTimezone(barberiaId) {
    if (!barberiaId) return 'America/Santiago';
    try {
        const barberia = await container.barberiaRepository.findById(barberiaId);
        return barberia?.timezone || 'America/Santiago';
    } catch {
        // Never block a booking due to a TZ lookup failure — fall back gracefully
        return 'America/Santiago';
    }
}

// =========================================================
// 1) CREATE RESERVA
// =========================================================
exports.crearReserva = async (req, res, next) => {
    try {
        const useCase = container.createReservaUseCase;

        // barberiaId: prefer authenticated user's barberiaId (admin context),
        // fall back to req.body.barberiaId for public booking routes (no auth).
        const barberiaId = req.user?.barberiaId || req.body.barberiaId;

        // Fetch the barbería's timezone so TimeSlot evaluations (isPast, isFuture)
        // are done in the tenant's local time, not the server's timezone.
        const timezone = await resolveTimezone(barberiaId);

        const reserva = await useCase.execute({
            barberoId: req.body.barberoId,
            clienteId: req.user?.id,
            nombreCliente: req.body.nombreCliente,
            emailCliente: req.body.emailCliente,
            barberiaId,
            servicioId: req.body.servicioId,
            fecha: req.body.fecha,
            hora: req.body.hora,
            timezone,
        });

        res.status(201).json({
            message: 'Reserva creada exitosamente',
            reserva: reserva.getDetails()
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 2) CANCEL RESERVA
// =========================================================
exports.cancelarReserva = async (req, res, next) => {
    try {
        const useCase = container.cancelReservaUseCase;
        const isAdmin = req.user.role === 'BARBERIA_ADMIN' || req.user.role === 'SUPER_ADMIN';

        // 📝 Pasar userId, isAdmin, barberiaId y request para auditoría
        const reserva = await useCase.execute(
            req.params.id,
            req.user.id,
            isAdmin,
            req.user.barberiaId,  // barberiaId for tenant isolation
            req                   // request para auditoría
        );

        res.json({
            message: 'Reserva cancelada exitosamente',
            reserva: reserva.getDetails()
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 3) CANCEL BY TOKEN (PUBLIC)
// =========================================================
exports.cancelarPorToken = async (req, res, next) => {
    try {
        const useCase = container.cancelReservaUseCase;
        const { token } = req.params;

        const reserva = await useCase.executeByToken(token);

        res.json({
            message: 'Reserva cancelada exitosamente',
            reserva: reserva.getDetails()
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 4) COMPLETE RESERVA
// =========================================================
exports.completarReserva = async (req, res, next) => {
    try {
        // Enforce RBAC: Clients should NOT be able to complete reservations
        if (req.user.rol === 'CLIENTE') {
            return res.status(403).json({ message: 'No tienes permiso para completar esta reserva' });
        }

        const useCase = container.completeReservaUseCase;

        const reserva = await useCase.execute(req.params.id, {
            generateReviewToken: true,
            barberiaId: req.user.barberiaId  // Add barberiaId for tenant isolation
        });

        res.json({
            message: 'Reserva completada exitosamente',
            reserva: reserva.getDetails()
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 5) RESCHEDULE RESERVA
// =========================================================
exports.reagendarReserva = async (req, res, next) => {
    try {
        const useCase = container.rescheduleReservaUseCase;
        const isAdmin = req.user.role === 'BARBERIA_ADMIN' || req.user.role === 'SUPER_ADMIN';

        const reserva = await useCase.execute(
            req.params.id,
            {
                fecha: req.body.fecha,
                hora: req.body.hora
            },
            req.user.id,
            isAdmin
        );

        res.json({
            message: 'Reserva reagendada exitosamente',
            reserva: reserva.getDetails()
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 6) RESCHEDULE BY TOKEN (PUBLIC)
// =========================================================
exports.reagendarPorToken = async (req, res, next) => {
    try {
        const useCase = container.rescheduleReservaUseCase;
        const { token } = req.params;

        const reserva = await useCase.executeByToken(token, {
            fecha: req.body.fecha,
            hora: req.body.hora
        });

        res.json({
            message: 'Reserva reagendada exitosamente',
            reserva: reserva.getDetails()
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 7) GET AVAILABLE SLOTS
// =========================================================
exports.obtenerHorariosDisponibles = async (req, res, next) => {
    try {
        const useCase = container.getAvailableSlotsUseCase;
        const barberiaId = req.user?.barberiaId || req.query.barberiaId;

        // Resolve barbería timezone for correct past-slot filtering
        const timezone = await resolveTimezone(barberiaId);

        const availableSlots = await useCase.execute({
            barberoId: req.query.barberoId,
            fecha: req.query.fecha,
            duracion: parseInt(req.query.duracion),
            barberiaId,
            timezone,
        });

        res.json({
            fecha: req.query.fecha,
            barberoId: req.query.barberoId,
            horariosDisponibles: availableSlots
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 8) LIST RESERVAS
// =========================================================
exports.listarReservas = async (req, res, next) => {
    try {
        const reservaRepository = container.reservaRepository;

        const filters = {};

        // Enforce Internal RBAC: Clients only see their own reservations
        if (req.user.rol === 'CLIENTE') {
            filters.clienteId = req.user.id;
        }

        // 🔒 R-01 FIX: BARBERO can only see their own appointments
        // Ignore barberoId query param to prevent IDOR across colleagues
        if (req.user.rol === 'BARBERO') {
            filters.barberoId = req.user._id;
        } else if (req.query.barberoId) {
            filters.barberoId = req.query.barberoId;
        }

        if (req.query.estado) filters.estado = req.query.estado;
        if (req.query.fecha) {
            const fecha = new Date(req.query.fecha);
            filters.fecha = {
                $gte: new Date(fecha.setHours(0, 0, 0, 0)),
                $lte: new Date(fecha.setHours(23, 59, 59, 999))
            };
        }

        const reservas = await reservaRepository.findByBarberiaId(
            req.user.barberiaId,
            filters
        );

        res.json({
            total: reservas.length,
            reservas: reservas.map(r => r.getDetails())
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 9) GET RESERVA BY ID
// =========================================================
exports.obtenerReserva = async (req, res, next) => {
    try {
        const reservaRepository = container.reservaRepository;
        const reserva = await reservaRepository.findById(req.params.id, req.user.barberiaId);

        if (!reserva) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        // Internal RBAC: If user is CLIENTE, they must be the owner
        if (req.user.rol === 'CLIENTE' && reserva.clienteId?.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'No tienes permiso para ver esta reserva' });
        }

        // No need for additional barberiaId check - repository already enforces tenant isolation
        res.json(reserva.getDetails());
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 10) GET RESERVA BY TOKEN (PUBLIC)
// =========================================================
exports.obtenerReservaPorToken = async (req, res, next) => {
    try {
        const reservaRepository = container.reservaRepository;
        const { token } = req.params;

        const reserva = await reservaRepository.findByCancelToken(token);

        if (!reserva) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        res.json(reserva.getDetails());
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 11) LIST ÚLTIMAS RESERVAS
// =========================================================
exports.listarUltimasReservas = async (req, res, next) => {
    try {
        const reservaRepository = container.reservaRepository;

        const reservas = await reservaRepository.findByBarberiaId(
            req.user.barberiaId,
            { estado: { $in: ['RESERVADA', 'COMPLETADA'] } }
        );

        const ultimasReservas = reservas
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

        res.json({
            total: ultimasReservas.length,
            reservas: ultimasReservas.map(r => r.getDetails())
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 12) LIST RESERVAS POR BARBERO
// =========================================================
exports.listarPorBarbero = async (req, res, next) => {
    try {
        const reservaRepository = container.reservaRepository;
        const { barberoId } = req.params;

        // 🔒 R-01 FIX: BARBERO can only see their own appointments
        if (req.user.rol === 'BARBERO' && req.user._id.toString() !== barberoId.toString()) {
            return res.status(403).json({ message: 'No tienes permiso para ver las citas de otro barbero' });
        }

        const filters = { barberoId };
        if (req.query.estado) filters.estado = req.query.estado;
        if (req.query.fecha) {
            const fecha = new Date(req.query.fecha);
            filters.fecha = {
                $gte: new Date(fecha.setHours(0, 0, 0, 0)),
                $lte: new Date(fecha.setHours(23, 59, 59, 999))
            };
        }

        const reservas = await reservaRepository.findByBarberiaId(
            req.user.barberiaId,
            filters
        );

        res.json({
            total: reservas.length,
            barberoId,
            reservas: reservas.map(r => r.getDetails())
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 13) GET RESERVA ID FROM TOKEN
// =========================================================
exports.obtenerIdDeToken = async (req, res, next) => {
    try {
        const reservaRepository = container.reservaRepository;
        const { token } = req.params;

        const reserva = await reservaRepository.findByCancelToken(token);

        if (!reserva) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        res.json({
            id: reserva.id,
            estado: reserva.estado
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 14) GET RESERVA DATA FOR REAGENDAR
// =========================================================
exports.getReservaParaReagendar = async (req, res, next) => {
    try {
        const reservaRepository = container.reservaRepository;
        const { token } = req.params;

        const reserva = await reservaRepository.findByCancelToken(token);

        if (!reserva) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        if (!reserva.canBeRescheduled()) {
            return res.status(400).json({
                message: 'Esta reserva no puede ser reagendada'
            });
        }

        res.json({
            reserva: reserva.getDetails(),
            canReschedule: true
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 15) CONFIRMAR REAGENDADO
// =========================================================
exports.confirmarReagendado = exports.reagendarPorToken;

// =========================================================
// 16) GET CALENDARIO (DATE RANGE)
// =========================================================
exports.obtenerCalendario = async (req, res, next) => {
    try {
        const { fechaInicio, fechaFin, barberoId } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ message: 'Se requieren fechaInicio y fechaFin' });
        }

        const inicio = new Date(fechaInicio + 'T00:00:00');
        const fin = new Date(fechaFin + 'T23:59:59.999');

        if (inicio > fin) {
            return res.status(400).json({ message: 'fechaInicio debe ser anterior a fechaFin' });
        }

        const barberiaId = req.user.barberiaId.toString();
        const cacheKey = `calendario:${barberiaId}:${fechaInicio}:${fechaFin}:${barberoId || 'todos'}`;

        // ── Layer 1: warm cache ──────────────────────────────────────────
        const cached = cacheService.get(cacheKey);
        if (cached !== undefined) return res.json(cached);

        // ── Layer 2: single-flight (prevent stampede) ──────────────────
        if (calendarInflight[cacheKey]) {
            return res.json(await calendarInflight[cacheKey]);
        }

        // ── Layer 3: DB fetch ──────────────────────────────────────────
        const fetch = async () => {
            const reservaRepository = container.reservaRepository;
            const filters = { fecha: { $gte: inicio, $lte: fin } };

            if (req.user.rol === 'BARBERO') {
                filters.barberoId = req.user._id;
            } else if (barberoId) {
                filters.barberoId = barberoId;
            }

            const reservas = await reservaRepository.findByBarberiaId(barberiaId, filters);

            const sorted = reservas.sort((a, b) => {
                const d = new Date(a.fecha) - new Date(b.fecha);
                return d !== 0 ? d : (a.timeSlot?.hora || '').localeCompare(b.timeSlot?.hora || '');
            });

            const payload = {
                fechaInicio, fechaFin,
                barberoId: barberoId || 'todos',
                total: sorted.length,
                reservas: sorted.map(r => r.getDetails())
            };

            cacheService.set(cacheKey, payload, CALENDARIO_TTL);
            return payload;
        };

        calendarInflight[cacheKey] = fetch();
        try {
            return res.json(await calendarInflight[cacheKey]);
        } finally {
            delete calendarInflight[cacheKey];
        }

    } catch (error) {
        next(error);
    }
};
// =========================================================
// 17) GET AI SLOT SUGGESTIONS
// =========================================================
exports.getAISuggestions = async (req, res, next) => {
    try {
        const useCase = container.getAISlotSuggestionsUseCase;

        const result = await useCase.execute({
            barberiaId: req.body.barberiaId,
            barberoId: req.body.barberoId,
            servicioId: req.body.servicioId,
            fechaDeseada: req.body.fechaDeseada,
            horaDeseada: req.body.horaDeseada
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
};
