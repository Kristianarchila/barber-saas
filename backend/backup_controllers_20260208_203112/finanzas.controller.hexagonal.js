/**
 * Finanzas Controller (Hexagonal Architecture Version)
 * Acts as an adapter in the interfaces layer
 */
const container = require('../shared/Container');

exports.getResumenFinanzas = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const useCase = container.getFinanzasSummaryUseCase;
        const summary = await useCase.execute(barberiaId.toString());

        res.json(summary);
    } catch (error) {
        next(error);
    }
};
