/**
 * Horario Controller (Hexagonal Architecture Version)
 * Acts as an adapter in the interfaces layer
 */
const container = require('../shared/Container');

// ==========================================
// 1) SAVE HORARIO (CREATE OR UPDATE)
// ==========================================
exports.saveHorario = async (req, res, next) => {
    try {
        const useCase = container.saveHorarioUseCase;
        const data = {
            ...req.body,
            barberoId: req.params.barberoId || req.body.barberoId
        };

        const horario = await useCase.execute(data, req.user);

        res.json({
            message: 'Horario guardado',
            horario: horario.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2) OBTENER HORARIOS POR BARBERO
// ==========================================
exports.getHorariosByBarbero = async (req, res, next) => {
    try {
        const useCase = container.getHorariosByBarberoUseCase;
        const horarios = await useCase.execute(req.params.barberoId, req.user.barberiaId);

        res.json(horarios.map(h => h.toObject()));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3) TOGGLE ACTIVO / INACTIVO
// ==========================================
exports.toggleHorario = async (req, res, next) => {
    try {
        const useCase = container.toggleHorarioUseCase;
        const horario = await useCase.execute(req.params.id, req.user.barberiaId);

        res.json(horario.toObject());
    } catch (error) {
        next(error);
    }
};

// ==========================================
// Aliases for compatibility
// ==========================================
exports.createHorario = exports.saveHorario;
exports.getHorarios = exports.getHorariosByBarbero;
