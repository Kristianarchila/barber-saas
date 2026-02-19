/**
 * Inventario Controller (Hexagonal Architecture Version)
 * Acts as an adapter in the interfaces layer
 */
const container = require('../shared/Container');

// ==========================================
// 1) OBTENER INVENTARIO COMPLETO
// ==========================================
exports.getInventario = async (req, res, next) => {
    try {
        const barberia = req.barberia;
        const useCase = container.getInventarioUseCase;
        const inventario = await useCase.execute(barberia._id, req.query);

        res.json({ inventario: inventario.map(i => i.toObject()) });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2) OBTENER ITEM ESPECÍFICO
// ==========================================
exports.getInventarioItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const barberia = req.barberia;
        const useCase = container.getInventarioItemUseCase;
        const item = await useCase.execute(id, barberia._id.toString());

        res.json({ item: item.toObject() });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3) CREAR REGISTRO DE INVENTARIO
// ==========================================
exports.createInventario = async (req, res, next) => {
    try {
        const barberia = req.barberia;
        const useCase = container.createInventarioUseCase;
        const inventario = await useCase.execute(barberia._id.toString(), req.body, req.user.id);

        res.status(201).json({ inventario: inventario.toObject() });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4) ACTUALIZAR CONFIGURACIÓN
// ==========================================
exports.updateInventario = async (req, res, next) => {
    try {
        const { id } = req.params;
        const barberia = req.barberia;
        const useCase = container.updateInventarioUseCase;
        const inventario = await useCase.execute(id, barberia._id.toString(), req.body);

        res.json({ inventario: inventario.toObject() });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5) REGISTRAR MOVIMIENTO
// ==========================================
exports.registrarMovimiento = async (req, res, next) => {
    try {
        const { id } = req.params;
        const barberia = req.barberia;
        const useCase = container.registrarMovimientoUseCase;

        const movimiento = await useCase.execute(id, barberia._id.toString(), req.body, req.user.id);

        res.status(201).json({
            movimiento: movimiento.toObject(),
            inventario: (await container.getInventarioItemUseCase.execute(id, barberia._id.toString())).toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 6) HISTORIAL DE MOVIMIENTOS
// ==========================================
exports.getMovimientos = async (req, res, next) => {
    try {
        const barberia = req.barberia;
        const useCase = container.getMovimientosUseCase;
        const result = await useCase.execute(barberia._id.toString(), req.query);

        res.json({
            movimientos: result.movimientos.map(m => m.toObject()),
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            total: result.total
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 7) ALERTAS DE STOCK BAJO
// ==========================================
exports.getAlertasStock = async (req, res, next) => {
    try {
        const barberia = req.barberia;
        const useCase = container.getAlertasStockUseCase;
        const result = await useCase.execute(barberia._id.toString());

        res.json({
            alertas: result.alertas.map(a => a.toObject()),
            total: result.total
        });
    } catch (error) {
        next(error);
    }
};
