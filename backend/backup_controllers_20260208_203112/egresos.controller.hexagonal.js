/**
 * Egresos Controller (Hexagonal Architecture Version)
 * Acts as an adapter in the interfaces layer
 */
const container = require('../shared/Container');

// ==========================================
// 1) REGISTRAR EGRESO
// ==========================================
exports.registrarEgreso = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const usuarioNombre = req.user.nombre || req.user.email;

        const useCase = container.registrarEgresoUseCase;
        const egreso = await useCase.execute(barberiaId.toString(), req.body, usuarioNombre);

        res.status(201).json({
            message: "Egreso registrado correctamente",
            egreso: egreso.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2) OBTENER EGRESOS
// ==========================================
exports.obtenerEgresos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const useCase = container.obtenerEgresosUseCase;
        const egresos = await useCase.execute(barberiaId.toString(), req.query);

        res.json(egresos.map(e => e.toObject()));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3) OBTENER RESUMEN
// ==========================================
exports.obtenerResumenEgresos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes } = req.query;

        const useCase = container.obtenerResumenEgresosUseCase;
        const resumen = await useCase.execute(barberiaId.toString(), mes);

        res.json(resumen);
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4) ACTUALIZAR EGRESO
// ==========================================
exports.actualizarEgreso = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { id } = req.params;

        const useCase = container.actualizarEgresoUseCase;
        const egreso = await useCase.execute(id, barberiaId.toString(), req.body);

        res.json({
            message: "Egreso actualizado correctamente",
            egreso: egreso.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5) ELIMINAR EGRESO
// ==========================================
exports.eliminarEgreso = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { id } = req.params;

        const useCase = container.eliminarEgresoUseCase;
        await useCase.execute(id, barberiaId.toString());

        res.json({
            message: "Egreso eliminado correctamente"
        });
    } catch (error) {
        next(error);
    }
};
