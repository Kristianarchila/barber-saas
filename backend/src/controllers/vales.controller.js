const container = require("../shared/Container");

/**
 * Vales Controller — barbero advance payments
 * barberiaId comes from req.user (set by tenantAdminMiddleware in app.js)
 */

exports.registrarVale = async (req, res, next) => {
    try {
        const { barberoId, monto, descripcion, fecha, metodoPago } = req.body;
        const barberiaId = req.user.barberiaId;

        if (!barberoId || !monto || !fecha) {
            return res.status(400).json({ message: "barberoId, monto y fecha son requeridos" });
        }

        const vale = await container.valeRepository.create({
            barberiaId,
            barberoId,
            monto: Number(monto),
            descripcion: descripcion || "Adelanto de comisión",
            fecha,
            metodoPago,
            autorizadoPor: `${req.user.nombre || req.user.email}`
        });

        res.status(201).json({ message: "Vale registrado exitosamente", vale });
    } catch (error) {
        next(error);
    }
};

exports.obtenerVales = async (req, res, next) => {
    try {
        const barberiaId = req.user.barberiaId;
        const { fechaInicio, fechaFin, barberoId, estado } = req.query;

        const vales = await container.valeRepository.findByBarberiaId(
            barberiaId,
            { fechaInicio, fechaFin, barberoId, estado }
        );

        res.json({ total: vales.length, vales });
    } catch (error) {
        next(error);
    }
};

exports.actualizarVale = async (req, res, next) => {
    try {
        const { id } = req.params;
        const barberiaId = req.user.barberiaId;
        const { estado, descripcion, monto } = req.body;

        const vale = await container.valeRepository.update(id, barberiaId, {
            ...(estado && { estado }),
            ...(descripcion && { descripcion }),
            ...(monto && { monto: Number(monto) }),
        });

        if (!vale) return res.status(404).json({ message: "Vale no encontrado" });

        res.json({ message: "Vale actualizado", vale });
    } catch (error) {
        next(error);
    }
};

exports.eliminarVale = async (req, res, next) => {
    try {
        const { id } = req.params;
        const barberiaId = req.user.barberiaId;

        const vale = await container.valeRepository.delete(id, barberiaId);
        if (!vale) return res.status(404).json({ message: "Vale no encontrado" });

        res.json({ message: "Vale eliminado" });
    } catch (error) {
        next(error);
    }
};
