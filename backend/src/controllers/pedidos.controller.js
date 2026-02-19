/**
 * Pedidos Controller (Hexagonal Architecture Version)
 * Acts as an adapter in the interfaces layer
 */
const container = require('../shared/Container');

// ==========================================
// 1) CREAR PEDIDO
// ==========================================
exports.crearPedido = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const useCase = container.createPedidoUseCase;
        const pedido = await useCase.execute(slug, req.body, req.user);

        res.status(201).json({
            message: 'Pedido creado exitosamente',
            pedido: pedido.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2) OBTENER PEDIDO POR ID
// ==========================================
exports.obtenerPedido = async (req, res, next) => {
    try {
        const { slug, id } = req.params;
        const useCase = container.getPedidoUseCase;
        const pedido = await useCase.execute(slug, id, req.user);

        res.json(pedido.toObject());
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3) OBTENER PEDIDOS DEL CLIENTE
// ==========================================
exports.obtenerMisPedidos = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const useCase = container.listMisPedidosUseCase;
        const result = await useCase.execute(slug, req.user.id, req.query);

        res.json({
            pedidos: result.pedidos.map(p => p.toObject()),
            paginacion: result.paginacion
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4) OBTENER TODOS LOS PEDIDOS (ADMIN)
// ==========================================
exports.obtenerTodosPedidos = async (req, res, next) => {
    try {
        const barberiaId = req.user.barberiaId;
        const useCase = container.listTodosPedidosUseCase;
        const result = await useCase.execute(barberiaId, req.query);

        res.json({
            pedidos: result.pedidos.map(p => p.toObject()),
            paginacion: result.paginacion
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5) ACTUALIZAR ESTADO (ADMIN)
// ==========================================
exports.actualizarEstado = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const barberiaId = req.user.barberiaId;
        const useCase = container.updatePedidoEstadoUseCase;

        const pedido = await useCase.execute(id, barberiaId, estado);

        res.json({
            message: 'Estado actualizado exitosamente',
            pedido: pedido.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 6) CANCELAR PEDIDO
// ==========================================
exports.cancelarPedido = async (req, res, next) => {
    try {
        const { slug, id } = req.params;
        const useCase = container.cancelPedidoUseCase;

        const pedido = await useCase.execute(slug, id, req.user);

        res.json({
            message: 'Pedido cancelado exitosamente',
            pedido: pedido.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 7) ESTADÍSTICAS (ADMIN)
// ==========================================
exports.obtenerEstadisticas = async (req, res, next) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        const barberiaId = req.user.barberiaId;
        const useCase = container.getPedidoStatsUseCase;

        const stats = await useCase.execute(barberiaId, fechaInicio, fechaFin);

        res.json(stats);
    } catch (error) {
        next(error);
    }
};
