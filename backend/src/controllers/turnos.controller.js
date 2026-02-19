/**
 * Turnos Controller (Hexagonal Architecture Version)
 */
const container = require('../shared/Container');

exports.getDisponibilidad = async (req, res, next) => {
    try {
        const useCase = container.getAvailableSlotsUseCase;
        const { barberoId } = req.params;
        const { fecha, servicioId } = req.query;

        if (!fecha || !servicioId) {
            return res.status(400).json({ message: "Debe enviar fecha y servicioId" });
        }

        const slots = await useCase.execute({
            barberoId,
            servicioId,
            fecha,
            barberiaId: req.barberia?._id
        });

        res.json({
            barberoId,
            fecha,
            servicioId,
            turnosDisponibles: slots
        });
    } catch (error) {
        next(error);
    }
};

exports.getTurnosDia = async (req, res, next) => {
    try {
        const { barberoId } = req.params;
        const { fecha } = req.query;

        const useCase = container.getTurnosDiaUseCase;
        const result = await useCase.execute(barberoId, fecha, req.user.barberiaId);

        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.getTurnosMes = async (req, res, next) => {
    try {
        const { barberoId } = req.params;
        const { fecha } = req.query;

        const useCase = container.getTurnosMesUseCase;
        const result = await useCase.execute(barberoId, fecha, req.user.barberiaId);

        res.json(result);
    } catch (error) {
        next(error);
    }
};
