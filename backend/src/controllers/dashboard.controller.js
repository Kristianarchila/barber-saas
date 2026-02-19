/**
 * Dashboard Controller (Hexagonal Architecture Version)
 */
const container = require('../shared/Container');

exports.getDashboardStats = async (req, res, next) => {
    try {
        // Validate that user has barberiaId
        if (!req.user || !req.user.barberiaId) {
            return res.status(400).json({
                message: 'Usuario no tiene una barbería asociada'
            });
        }

        const barberiaId = req.user.barberiaId.toString();

        const useCase = container.getDashboardStatsUseCase;
        const stats = await useCase.execute(barberiaId);

        res.json(stats);
    } catch (error) {
        next(error);
    }
};
