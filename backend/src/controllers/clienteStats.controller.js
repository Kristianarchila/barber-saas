const container = require('../shared/Container');

/**
 * @file clienteStats.controller.js
 * @description Controller for managing client statistics and cancellation limits
 */

/**
 * Get all client stats for a barberia
 * @route GET /api/:slug/admin/cliente-stats
 */
exports.getClienteStats = async (req, res, next) => {
    try {
        const { barberiaId } = req;
        const { bloqueado, email, limit = 100 } = req.query;

        const filters = {
            limit: parseInt(limit)
        };

        if (bloqueado !== undefined) {
            filters.bloqueado = bloqueado === 'true';
        }

        if (email) {
            filters.email = email;
        }

        const clienteStatsRepo = container.clienteStatsRepository;
        const stats = await clienteStatsRepo.findByBarberiaId(barberiaId, filters);

        res.json({
            success: true,
            data: stats.map(s => s.getDetails()),
            count: stats.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get stats for a specific client
 * @route GET /api/:slug/admin/cliente-stats/:email
 */
exports.getClienteStatsByEmail = async (req, res, next) => {
    try {
        const { barberiaId } = req;
        const { email } = req.params;

        const clienteStatsRepo = container.clienteStatsRepository;
        const stats = await clienteStatsRepo.findByEmail(email, barberiaId);

        if (!stats) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron estadísticas para este cliente'
            });
        }

        res.json({
            success: true,
            data: stats.getDetails()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all blocked clients
 * @route GET /api/:slug/admin/cliente-stats/bloqueados
 */
exports.getBloqueados = async (req, res, next) => {
    try {
        const { barberiaId } = req;

        const clienteStatsRepo = container.clienteStatsRepository;
        const bloqueados = await clienteStatsRepo.findBloqueados(barberiaId);

        res.json({
            success: true,
            data: bloqueados.map(s => s.getDetails()),
            count: bloqueados.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Manually block a client
 * @route POST /api/:slug/admin/cliente-stats/:email/bloquear
 */
exports.bloquearCliente = async (req, res, next) => {
    try {
        const { barberiaId } = req;
        const { email } = req.params;
        const { motivo, diasBloqueo = 30 } = req.body;

        if (!motivo) {
            return res.status(400).json({
                success: false,
                message: 'El motivo es requerido'
            });
        }

        const clienteStatsRepo = container.clienteStatsRepository;
        const stats = await clienteStatsRepo.bloquear(
            email,
            barberiaId,
            motivo,
            parseInt(diasBloqueo)
        );

        res.json({
            success: true,
            message: 'Cliente bloqueado exitosamente',
            data: stats.getDetails()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Manually unblock a client
 * @route POST /api/:slug/admin/cliente-stats/:email/desbloquear
 */
exports.desbloquearCliente = async (req, res, next) => {
    try {
        const { barberiaId } = req;
        const { email } = req.params;

        const clienteStatsRepo = container.clienteStatsRepository;
        const stats = await clienteStatsRepo.desbloquear(email, barberiaId);

        res.json({
            success: true,
            message: 'Cliente desbloqueado exitosamente',
            data: stats.getDetails()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get cancellation policies for barberia
 * @route GET /api/:slug/admin/cliente-stats/politicas
 */
exports.getPoliticas = async (req, res, next) => {
    try {
        const { barberiaId } = req;

        const barberiaRepo = container.barberiaRepository;
        const barberia = await barberiaRepo.findById(barberiaId);

        if (!barberia) {
            return res.status(404).json({
                success: false,
                message: 'Barbería no encontrada'
            });
        }

        res.json({
            success: true,
            data: barberia.politicasCancelacion || {
                enabled: true,
                horasMinCancelacion: 24,
                maxCancelacionesPorMes: 3,
                bloquearTrasExceder: false,
                diasBloqueo: 30,
                mensajeBloqueo: 'Has excedido el límite de cancelaciones permitidas'
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update cancellation policies
 * @route PUT /api/:slug/admin/cliente-stats/politicas
 */
exports.updatePoliticas = async (req, res, next) => {
    try {
        const { barberiaId } = req;
        const {
            enabled,
            horasMinCancelacion,
            maxCancelacionesPorMes,
            bloquearTrasExceder,
            diasBloqueo,
            mensajeBloqueo
        } = req.body;

        const politicas = {};

        if (enabled !== undefined) politicas['politicasCancelacion.enabled'] = enabled;
        if (horasMinCancelacion !== undefined) politicas['politicasCancelacion.horasMinCancelacion'] = parseInt(horasMinCancelacion);
        if (maxCancelacionesPorMes !== undefined) politicas['politicasCancelacion.maxCancelacionesPorMes'] = parseInt(maxCancelacionesPorMes);
        if (bloquearTrasExceder !== undefined) politicas['politicasCancelacion.bloquearTrasExceder'] = bloquearTrasExceder;
        if (diasBloqueo !== undefined) politicas['politicasCancelacion.diasBloqueo'] = parseInt(diasBloqueo);
        if (mensajeBloqueo !== undefined) politicas['politicasCancelacion.mensajeBloqueo'] = mensajeBloqueo;

        const barberiaRepo = container.barberiaRepository;
        const barberia = await barberiaRepo.update(barberiaId, politicas);

        res.json({
            success: true,
            message: 'Políticas de cancelación actualizadas',
            data: barberia.politicasCancelacion
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get statistics summary
 * @route GET /api/:slug/admin/cliente-stats/summary
 */
exports.getSummary = async (req, res, next) => {
    try {
        const { barberiaId } = req;

        const clienteStatsRepo = container.clienteStatsRepository;

        const totalClientes = await clienteStatsRepo.countByBarberiaId(barberiaId);
        const bloqueados = await clienteStatsRepo.countByBarberiaId(barberiaId, { bloqueado: true });
        const activos = totalClientes - bloqueados;

        res.json({
            success: true,
            data: {
                totalClientes,
                clientesBloqueados: bloqueados,
                clientesActivos: activos,
                porcentajeBloqueados: totalClientes > 0 ? Math.round((bloqueados / totalClientes) * 100) : 0
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Manually trigger monthly reset (for testing)
 * @route POST /api/:slug/admin/cliente-stats/reset-monthly
 */
exports.resetMonthly = async (req, res, next) => {
    try {
        const ResetMonthlyCancelaciones = require('../application/use-cases/clientes/ResetMonthlyCancelaciones');
        const resetUseCase = new ResetMonthlyCancelaciones(container.clienteStatsRepository);

        const result = await resetUseCase.execute();

        res.json({
            success: true,
            message: 'Reset mensual ejecutado exitosamente',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports;
