/**
 * @file bloqueos.controller.js
 * @description Controller for date/time blocking management
 */

const CreateBloqueo = require('../application/use-cases/bloqueos/CreateBloqueo');
const GetBloqueos = require('../application/use-cases/bloqueos/GetBloqueos');
const DeleteBloqueo = require('../application/use-cases/bloqueos/DeleteBloqueo');
const MongoBloqueoRepository = require('../infrastructure/database/mongodb/repositories/MongoBloqueoRepository');
const MongoBarberiaRepository = require('../infrastructure/database/mongodb/repositories/MongoBarberiaRepository');

// Initialize repositories
const bloqueoRepository = new MongoBloqueoRepository();
const barberiaRepository = new MongoBarberiaRepository();

// Initialize use cases
const createBloqueo = new CreateBloqueo(bloqueoRepository, barberiaRepository);
const getBloqueos = new GetBloqueos(bloqueoRepository);
const deleteBloqueo = new DeleteBloqueo(bloqueoRepository);

/**
 * Creates a new bloqueo
 * POST /api/barberias/:slug/admin/bloqueos
 */
exports.crearBloqueo = async (req, res) => {
    try {
        const { barberiaId } = req;
        const { barberoId, tipo, fechaInicio, fechaFin, horaInicio, horaFin, motivo, todoElDia } = req.body;

        const bloqueo = await createBloqueo.execute({
            barberiaId,
            barberoId: barberoId || null,
            tipo,
            fechaInicio,
            fechaFin,
            horaInicio: horaInicio || null,
            horaFin: horaFin || null,
            motivo,
            todoElDia: todoElDia !== false,
            creadoPor: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Bloqueo creado exitosamente',
            data: bloqueo
        });
    } catch (error) {
        console.error('Error al crear bloqueo:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al crear bloqueo'
        });
    }
};

/**
 * Gets all bloqueos for a barberia
 * GET /api/barberias/:slug/admin/bloqueos
 */
exports.obtenerBloqueos = async (req, res) => {
    try {
        const { barberiaId } = req;
        const { activo, tipo, barberoId } = req.query;

        const filters = {};
        if (activo !== undefined) filters.activo = activo === 'true';
        if (tipo) filters.tipo = tipo;
        if (barberoId) filters.barberoId = barberoId;

        const bloqueos = await getBloqueos.execute(barberiaId, filters);

        res.json({
            success: true,
            data: bloqueos
        });
    } catch (error) {
        console.error('Error al obtener bloqueos:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener bloqueos'
        });
    }
};

/**
 * Gets bloqueos for a specific date range
 * GET /api/barberias/:slug/admin/bloqueos/rango
 */
exports.obtenerBloqueosPorRango = async (req, res) => {
    try {
        const { barberiaId } = req;
        const { fechaInicio, fechaFin, barberoId } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({
                success: false,
                message: 'fechaInicio y fechaFin son requeridos'
            });
        }

        const bloqueos = await getBloqueos.getByDateRange(
            barberiaId,
            new Date(fechaInicio),
            new Date(fechaFin),
            barberoId || null
        );

        res.json({
            success: true,
            data: bloqueos
        });
    } catch (error) {
        console.error('Error al obtener bloqueos por rango:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener bloqueos'
        });
    }
};

/**
 * Gets bloqueos for a specific date
 * GET /api/barberias/:slug/admin/bloqueos/fecha/:fecha
 */
exports.obtenerBloqueosPorFecha = async (req, res) => {
    try {
        const { barberiaId } = req;
        const { fecha } = req.params;
        const { barberoId } = req.query;

        const bloqueos = await getBloqueos.getByDate(
            barberiaId,
            new Date(fecha),
            barberoId || null
        );

        res.json({
            success: true,
            data: bloqueos
        });
    } catch (error) {
        console.error('Error al obtener bloqueos por fecha:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener bloqueos'
        });
    }
};

/**
 * Deletes (deactivates) a bloqueo
 * DELETE /api/barberias/:slug/admin/bloqueos/:id
 */
exports.eliminarBloqueo = async (req, res) => {
    try {
        const { barberiaId } = req;
        const { id } = req.params;

        await deleteBloqueo.execute(id, barberiaId);

        res.json({
            success: true,
            message: 'Bloqueo eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar bloqueo:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al eliminar bloqueo'
        });
    }
};
