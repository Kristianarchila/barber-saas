const container = require('../shared/Container');

/**
 * Venta Controller
 * Acts as an adapter in the interfaces layer
 */
exports.registrarVenta = async (req, res, next) => {
    try {
        const { barberiaId } = req; // From extractBarberiaId middleware
        const ventaData = req.body;

        const useCase = container.registrarVentaRapidaUseCase;
        const venta = await useCase.execute(barberiaId.toString(), ventaData);

        res.status(201).json({
            success: true,
            message: "Venta registrada con éxito",
            venta: venta.toObject()
        });
    } catch (error) {
        next(error);
    }
};

exports.obtenerHistorialVentas = async (req, res, next) => {
    try {
        const { barberiaId } = req;
        const { barberoId, metodoPago, fechaInicio, fechaFin, limite } = req.query;

        const useCase = container.listVentasUseCase; // To be implemented or used directly via repository
        // For now, let's assume we want to implement a simple list in the controller or via repository
        const repository = container.ventaRepository;
        const ventas = await repository.findAll({
            barberiaId: barberiaId.toString(),
            barberoId,
            metodoPago,
            fechaInicio,
            fechaFin,
            limite: parseInt(limite) || 50
        });

        res.json({
            success: true,
            ventas: ventas.map(v => v.toObject())
        });
    } catch (error) {
        next(error);
    }
};
