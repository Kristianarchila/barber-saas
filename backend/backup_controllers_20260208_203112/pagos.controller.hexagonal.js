/**
 * Pagos Controller (Hexagonal Architecture Version)
 * Acts as an adapter in the interfaces layer
 */
const container = require('../shared/Container');

// ==========================================
// 1) REGISTRAR PAGO
// ==========================================
exports.registrarPago = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const registradoPor = req.user.nombre || req.user.email;
        const { reservaId, detallesPago } = req.body;

        const useCase = container.registrarPagoUseCase;
        const pago = await useCase.execute(barberiaId.toString(), {
            reservaId,
            detallesPago,
            registradoPor
        });

        res.status(201).json({
            message: "Pago registrado correctamente",
            pago: pago.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2) OBTENER PAGOS
// ==========================================
exports.obtenerPagos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const useCase = container.obtenerPagosUseCase;
        const pagos = await useCase.execute(barberiaId.toString(), req.query);

        res.json(pagos.map(p => p.toObject()));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3) OBTENER RESUMEN
// ==========================================
exports.obtenerResumenIngresos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes } = req.query;

        const useCase = container.obtenerResumenIngresosUseCase;
        const resumen = await useCase.execute(barberiaId.toString(), mes);

        res.json(resumen);
    } catch (error) {
        next(error);
    }
};
