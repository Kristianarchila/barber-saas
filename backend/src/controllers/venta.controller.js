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

        // Validate barberoId is a real ObjectId (24 hex chars) — avoid CastError
        const mongoose = require('mongoose');
        const filters = {
            barberiaId: barberiaId.toString(),
            metodoPago: metodoPago || undefined,
            fechaInicio: fechaInicio || undefined,
            fechaFin: fechaFin || undefined,
            limite: parseInt(limite) || 50
        };

        if (barberoId && mongoose.isValidObjectId(barberoId)) {
            filters.barberoId = barberoId;
        }
        // If barberoId is invalid (e.g. 'pedro'), simply omit it from filters

        const repository = container.ventaRepository;
        const ventas = await repository.findAll(filters);

        res.json({
            success: true,
            ventas: ventas.map(v => v.toObject())
        });
    } catch (error) {
        next(error);
    }
};

