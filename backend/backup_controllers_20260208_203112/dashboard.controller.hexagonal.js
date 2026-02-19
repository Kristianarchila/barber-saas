/**
 * Dashboard Controller (Hexagonal Architecture Version)
 */
const container = require('../shared/Container');

exports.getDashboardStats = async (req, res, next) => {
    try {
        const barberiaId = req.user.barberiaId.toString();

        const useCase = container.getDashboardStatsUseCase;
        const stats = await useCase.execute(barberiaId);

        res.json(stats);
    } catch (error) {
        next(error);
    }
};
