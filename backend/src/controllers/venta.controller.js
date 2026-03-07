const container = require('../shared/Container');
const Venta = require('../infrastructure/database/mongodb/models/Venta');

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

/**
 * GET /ventas/top-productos
 * Returns real top-selling products aggregated from the Venta collection.
 * Groups by product ID across all sales for the current month.
 */
exports.getTopProductos = async (req, res, next) => {
    try {
        const { barberiaId } = req;
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

        const topProductos = await Venta.aggregate([
            {
                $match: {
                    barberiaId: barberiaId,
                    createdAt: { $gte: inicioMes },
                    'items.type': 'producto'
                }
            },
            { $unwind: '$items' },
            { $match: { 'items.type': 'producto' } },
            {
                $group: {
                    _id: '$items.itemId',
                    nombre: { $first: '$items.nombre' },
                    cantidadVendida: { $sum: '$items.cantidad' },
                    totalGenerado: { $sum: '$items.subtotal' }
                }
            },
            { $sort: { cantidadVendida: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    productoId: '$_id',
                    nombre: 1,
                    cantidadVendida: 1,
                    totalGenerado: 1
                }
            }
        ]);

        res.json({ success: true, topProductos });
    } catch (error) {
        next(error);
    }
};


