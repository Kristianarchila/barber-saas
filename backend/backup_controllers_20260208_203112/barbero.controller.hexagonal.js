/**
 * Barbero Controller (Hexagonal Architecture Version)
 * Acts as an adapter in the interfaces layer
 */
const container = require('../shared/Container');

// ==========================================
// 1) CREATE BARBERO CON USUARIO
// ==========================================
exports.createBarberoConUsuario = async (req, res, next) => {
    try {
        if (req.user.rol !== 'BARBERIA_ADMIN' && req.user.rol !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const barberiaId = req.user.barberiaId;
        const useCase = container.createBarberoUseCase;

        const barbero = await useCase.execute({
            ...req.body,
            barberiaId
        });

        res.status(201).json({
            message: 'Barbero creado correctamente',
            barbero: barbero.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2) LISTAR BARBEROS (ADMIN / SUPER)
// ==========================================
exports.getBarberos = async (req, res, next) => {
    try {
        const barberiaId = req.user.barberiaId;
        const useCase = container.listBarberosUseCase;

        const barberos = await useCase.execute(barberiaId);

        res.json({
            total: barberos.length,
            barberos: barberos.map(b => ({
                ...b.toObject(),
                usuario: b.usuario // Include populated user info
            }))
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3) OBTENER BARBERO POR ID
// ==========================================
exports.getBarberoById = async (req, res, next) => {
    try {
        const useCase = container.getBarberoByIdUseCase;
        const barbero = await useCase.execute(req.params.id);

        res.json({
            ...barbero.toObject(),
            usuario: barbero.usuario
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4) ACTUALIZAR BARBERO
// ==========================================
exports.updateBarbero = async (req, res, next) => {
    try {
        const useCase = container.updateBarberoUseCase;
        const barbero = await useCase.execute(req.params.id, req.body, req.user);

        res.json({
            message: 'Barbero actualizado',
            barbero: barbero.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5) ELIMINAR BARBERO
// ==========================================
exports.deleteBarbero = async (req, res, next) => {
    try {
        const useCase = container.deleteBarberoUseCase;
        await useCase.execute(req.params.id);

        res.json({ message: 'Barbero eliminado' });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 6) TOGGLE ACTIVO / INACTIVO
// ==========================================
exports.toggleEstado = async (req, res, next) => {
    try {
        const useCase = container.toggleBarberoStatusUseCase;
        const activo = await useCase.execute(req.params.id);

        res.json({
            message: `Barbero ${activo ? 'activado' : 'desactivado'}`
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 7) BARBEROS PÚBLICOS (PARA RESERVAS)
// ==========================================
exports.getBarberosPublicos = async (req, res, next) => {
    try {
        const { barberiaId } = req.query;
        if (!barberiaId) {
            return res.status(400).json({ message: 'barberiaId requerido' });
        }

        const useCase = container.listBarberosUseCase;
        const barberos = await useCase.execute(barberiaId, { onlyActive: true });

        res.json({
            total: barberos.length,
            barberos: barberos.map(b => b.getDetails())
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 8) MI PERFIL (BARBERO)
// ==========================================
exports.getMiPerfil = async (req, res, next) => {
    try {
        const useCase = container.getMiPerfilUseCase;
        const barbero = await useCase.execute(req.user.id);

        res.json({
            ...barbero.toObject(),
            usuario: barbero.usuario
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 9) MIS CITAS (HISTORIAL)
// ==========================================
exports.getMisCitas = async (req, res, next) => {
    try {
        const useCase = container.getMisCitasUseCase;
        const citas = await useCase.execute(req.user.id, req.user.barberiaId);

        res.json(citas.map(c => c.toObject()));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 10) AGENDA DEL DÍA (BARBERO)
// ==========================================
exports.getAgenda = async (req, res, next) => {
    try {
        const useCase = container.getAgendaUseCase;
        const reservas = await useCase.execute(req.user.id, req.query.fecha);

        res.json(reservas.map(r => r.toObject()));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 11) COMPLETAR RESERVA
// ==========================================
exports.completarReserva = async (req, res, next) => {
    try {
        // 1. Get barbero for security check
        const barbero = await container.barberoRepository.findByUsuarioId(req.user.id);
        if (!barbero) return res.status(404).json({ message: 'Barbero no encontrado' });

        // 2. Get reserva and check ownership
        const reserva = await container.reservaRepository.findById(req.params.id);
        if (!reserva || reserva.barberoId.toString() !== barbero.id.toString()) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        // 3. Delegate to existing completeReservaUseCase
        const useCase = container.completeReservaUseCase;
        await useCase.execute(req.params.id);

        res.json({ message: 'Reserva completada' });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 12) CANCELAR RESERVA
// ==========================================
exports.cancelarReserva = async (req, res, next) => {
    try {
        // 1. Get barbero for security check
        const barbero = await container.barberoRepository.findByUsuarioId(req.user.id);
        if (!barbero) return res.status(404).json({ message: 'Barbero no encontrado' });

        // 2. Get reserva and check ownership
        const reserva = await container.reservaRepository.findById(req.params.id);
        if (!reserva || reserva.barberoId.toString() !== barbero.id.toString()) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        // 3. Delegate to existing cancelReservaUseCase
        const useCase = container.cancelReservaUseCase;
        await useCase.execute(req.params.id);

        res.json({ message: 'Reserva cancelada' });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 13) ESTADÍSTICAS DEL BARBERO
// ==========================================
exports.getEstadisticas = async (req, res, next) => {
    try {
        const useCase = container.getEstadisticasBarberoUseCase;
        const stats = await useCase.execute(req.user.id);

        res.json(stats);
    } catch (error) {
        next(error);
    }
};
