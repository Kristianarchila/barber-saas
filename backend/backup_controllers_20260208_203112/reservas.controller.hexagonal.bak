/**
 * Reservas Controller (Hexagonal Architecture Version)
 * This controller acts as an adapter in the interfaces layer
 * It delegates business logic to use cases
 */

const container = require('../shared/Container');
const Barbero = require('../infrastructure/database/mongodb/models/Barbero');
const Horario = require('../infrastructure/database/mongodb/models/Horario');

// =========================================================
// 1) CREATE RESERVA
// =========================================================
exports.crearReserva = async (req, res, next) => {
    try {
        const useCase = container.createReservaUseCase;

        const reserva = await useCase.execute({
            barberoId: req.body.barberoId,
            clienteId: req.user?.id,
            nombreCliente: req.body.nombreCliente,
            emailCliente: req.body.emailCliente,
            barberiaId: req.user.barberiaId,
            servicioId: req.body.servicioId,
            fecha: req.body.fecha,
            hora: req.body.hora
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

        const reserva = await useCase.execute(
            req.params.id,
            req.user.id,
            isAdmin
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
        const useCase = container.completeReservaUseCase;

        const reserva = await useCase.execute(req.params.id, {
            generateReviewToken: true
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
        // Note: We need to pass barberoRepository and horarioRepository
        // For now, we'll use the models directly until we create those repositories
        const barberoRepository = { findById: (id) => Barbero.findById(id) };
        const horarioRepository = {
            findByBarberoAndDay: async (barberoId, dayOfWeek) => {
                return await Horario.findOne({ barberoId, dia: dayOfWeek });
            }
        };

        const useCase = container.getAvailableSlotsUseCase(barberoRepository, horarioRepository);

        const availableSlots = await useCase.execute({
            barberoId: req.query.barberoId,
            fecha: req.query.fecha,
            duracion: parseInt(req.query.duracion)
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
        if (req.query.estado) filters.estado = req.query.estado;
        if (req.query.barberoId) filters.barberoId = req.query.barberoId;
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
        const reserva = await reservaRepository.findById(req.params.id);

        if (!reserva) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        // Validate ownership
        if (reserva.barberiaId !== req.user.barberiaId) {
            return res.status(403).json({ message: 'No tienes acceso a esta reserva' });
        }

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
