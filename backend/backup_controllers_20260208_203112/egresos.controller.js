const Egreso = require("../models/Egreso");

/**
 * Controller de Egresos
 * Gestiona gastos categorizados con IVA crédito fiscal
 */

// Registrar nuevo egreso
exports.registrarEgreso = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const egresoData = {
            ...req.body,
            barberiaId,
            registradoPor: req.user.nombre || req.user.email
        };

        const egreso = await Egreso.create(egresoData);

        res.status(201).json({
            message: "Egreso registrado correctamente",
            egreso
        });

    } catch (error) {
        console.error("Error al registrar egreso:", error);
        next(error);
    }
};

// Obtener egresos con filtros
exports.obtenerEgresos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { fechaInicio, fechaFin, categoria } = req.query;

        const filtro = { barberiaId, activo: true };

        if (fechaInicio && fechaFin) {
            filtro.fecha = { $gte: fechaInicio, $lte: fechaFin };
        }

        if (categoria) {
            filtro.categoria = categoria;
        }

        const egresos = await Egreso.find(filtro)
            .sort({ fecha: -1, createdAt: -1 })
            .limit(100);

        res.json(egresos);

    } catch (error) {
        console.error("Error al obtener egresos:", error);
        next(error);
    }
};

// Obtener resumen de egresos
exports.obtenerResumenEgresos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes } = req.query; // Formato: YYYY-MM

        const hoy = new Date().toISOString().slice(0, 10);
        const inicioMes = mes || hoy.slice(0, 7);
        const finMes = `${inicioMes}-31`;

        const egresos = await Egreso.find({
            barberiaId,
            fecha: { $gte: `${inicioMes}-01`, $lte: finMes },
            activo: true
        });

        // Calcular totales
        const totalEgresos = egresos.reduce((sum, e) => sum + e.montoTotal, 0);
        const totalIvaCredito = egresos.reduce((sum, e) => sum + e.iva, 0);

        // Resumen por categoría
        const porCategoria = await Egreso.resumenPorCategoria(
            barberiaId,
            `${inicioMes}-01`,
            finMes
        );

        // Egresos de hoy
        const egresosHoy = egresos.filter(e => e.fecha === hoy);
        const totalHoy = egresosHoy.reduce((sum, e) => sum + e.montoTotal, 0);

        res.json({
            periodo: inicioMes,
            totalEgresos,
            totalIvaCredito,
            egresosHoy: totalHoy,
            cantidadEgresos: egresos.length,
            porCategoria: porCategoria.map(cat => ({
                categoria: cat._id,
                total: cat.total,
                cantidad: cat.cantidad,
                porcentaje: totalEgresos > 0 ? Math.round((cat.total / totalEgresos) * 100) : 0
            }))
        });

    } catch (error) {
        console.error("Error al obtener resumen de egresos:", error);
        next(error);
    }
};

// Actualizar egreso
exports.actualizarEgreso = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { id } = req.params;

        const egreso = await Egreso.findOneAndUpdate(
            { _id: id, barberiaId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!egreso) {
            return res.status(404).json({ message: "Egreso no encontrado" });
        }

        res.json({
            message: "Egreso actualizado correctamente",
            egreso
        });

    } catch (error) {
        console.error("Error al actualizar egreso:", error);
        next(error);
    }
};

// Eliminar egreso (soft delete)
exports.eliminarEgreso = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { id } = req.params;

        const egreso = await Egreso.findOneAndUpdate(
            { _id: id, barberiaId },
            { activo: false },
            { new: true }
        );

        if (!egreso) {
            return res.status(404).json({ message: "Egreso no encontrado" });
        }

        res.json({
            message: "Egreso eliminado correctamente"
        });

    } catch (error) {
        console.error("Error al eliminar egreso:", error);
        next(error);
    }
};

module.exports = {
    registrarEgreso: exports.registrarEgreso,
    obtenerEgresos: exports.obtenerEgresos,
    obtenerResumenEgresos: exports.obtenerResumenEgresos,
    actualizarEgreso: exports.actualizarEgreso,
    eliminarEgreso: exports.eliminarEgreso
};
