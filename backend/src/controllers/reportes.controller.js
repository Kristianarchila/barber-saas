/**
 * Reportes Controller (Hexagonal Architecture Version)
 */
const container = require('../shared/Container');

exports.obtenerResumenGeneral = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes, fechaInicio, fechaFin } = req.query;

        const useCase = container.getResumenGeneralUseCase;
        const resumen = await useCase.execute(barberiaId, { mes, fechaInicio, fechaFin });

        res.json(resumen);
    } catch (error) {
        console.error("Error al obtener resumen general:", error);
        next(error);
    }
};

exports.obtenerRendimientoBarberos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes } = req.query;

        const useCase = container.getRendimientoBarberosUseCase;
        const rendimiento = await useCase.execute(barberiaId, { mes });

        res.json(rendimiento);
    } catch (error) {
        console.error("Error al obtener rendimiento de barberos:", error);
        next(error);
    }
};

exports.obtenerServiciosMasVendidos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes } = req.query;

        const useCase = container.getServiciosMasVendidosUseCase;
        const result = await useCase.execute(barberiaId, { mes });

        res.json(result);
    } catch (error) {
        console.error("Error al obtener servicios más vendidos:", error);
        next(error);
    }
};

exports.obtenerAnalisisPagos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes } = req.query;

        const useCase = container.getAnalisisPagosUseCase;
        const analisis = await useCase.execute(barberiaId, { mes });

        res.json(analisis);
    } catch (error) {
        console.error("Error al obtener análisis de pagos:", error);
        next(error);
    }
};

exports.obtenerTendenciasIngresos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes } = req.query;

        const useCase = container.getTendenciasIngresosUseCase;
        const tendencias = await useCase.execute(barberiaId, { mes });

        res.json(tendencias);
    } catch (error) {
        console.error("Error al obtener tendencias de ingresos:", error);
        next(error);
    }
};
