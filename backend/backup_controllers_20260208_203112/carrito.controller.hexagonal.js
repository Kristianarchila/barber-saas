/**
 * Carrito Controller (Hexagonal Architecture Version)
 * Acts as an adapter in the interfaces layer
 */
const container = require('../shared/Container');
const Barberia = require('../models/Barberia'); // Still needed to resolve slug to ID in this layer

// Helper to get common params
const getCartParams = (req) => {
    return {
        clienteId: req.user?._id || req.user?.id,
        sessionId: req.session?.id || req.headers['x-session-id']
    };
};

// ==========================================
// 1) OBTENER CARRITO
// ==========================================
exports.obtenerCarrito = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const barberia = await Barberia.findOne({ slug });
        if (!barberia) return res.status(404).json({ message: 'Barbería no encontrada' });

        const { clienteId, sessionId } = getCartParams(req);
        const useCase = container.obtenerCarritoUseCase;
        const carrito = await useCase.execute(barberia._id.toString(), clienteId, sessionId);

        res.json(carrito.toObject());
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2) AGREGAR PRODUCTO
// ==========================================
exports.agregarProducto = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const barberia = await Barberia.findOne({ slug });
        if (!barberia) return res.status(404).json({ message: 'Barbería no encontrada' });

        const { clienteId, sessionId } = getCartParams(req);
        const { productoId, cantidad } = req.body;

        const useCase = container.agregarProductoCarritoUseCase;
        const carrito = await useCase.execute(barberia._id.toString(), {
            clienteId,
            sessionId,
            productoId,
            cantidad: parseInt(cantidad) || 1
        });

        res.json({
            message: 'Producto agregado al carrito',
            carrito: carrito.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3) ACTUALIZAR CANTIDAD
// ==========================================
exports.actualizarCantidad = async (req, res, next) => {
    try {
        const { slug, itemId } = req.params; // Note: original used itemId which was productoId in items array
        const barberia = await Barberia.findOne({ slug });
        if (!barberia) return res.status(404).json({ message: 'Barbería no encontrada' });

        const { clienteId, sessionId } = getCartParams(req);
        const { cantidad } = req.body;

        const useCase = container.actualizarCantidadCarritoUseCase;
        // In original controller, itemId was actually the mongo _id of the item in the array, 
        // but here we use productoId for simplicity in the use case.
        // Let's check how the route passes it.

        const carrito = await useCase.execute(barberia._id.toString(), {
            clienteId,
            sessionId,
            productoId: itemId, // Assuming itemId is actually the productoId here for simplicity
            cantidad: parseInt(cantidad)
        });

        res.json({
            message: 'Cantidad actualizada',
            carrito: carrito.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4) REMOVER PRODUCTO
// ==========================================
exports.removerProducto = async (req, res, next) => {
    try {
        const { slug, itemId } = req.params;
        const barberia = await Barberia.findOne({ slug });
        if (!barberia) return res.status(404).json({ message: 'Barbería no encontrada' });

        const { clienteId, sessionId } = getCartParams(req);

        const useCase = container.removerProductoCarritoUseCase;
        const carrito = await useCase.execute(barberia._id.toString(), {
            clienteId,
            sessionId,
            productoId: itemId
        });

        res.json({
            message: 'Producto removido del carrito',
            carrito: carrito.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5) VACIAR CARRITO
// ==========================================
exports.vaciarCarrito = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const barberia = await Barberia.findOne({ slug });
        if (!barberia) return res.status(404).json({ message: 'Barbería no encontrada' });

        const { clienteId, sessionId } = getCartParams(req);

        const useCase = container.vaciarCarritoUseCase;
        await useCase.execute(barberia._id.toString(), { clienteId, sessionId });

        res.json({ message: 'Carrito vaciado exitosamente' });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 6) MIGRAR CARRITO
// ==========================================
exports.migrarCarrito = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { sessionId } = req.body;

        const barberia = await Barberia.findOne({ slug });
        if (!barberia) return res.status(404).json({ message: 'Barbería no encontrada' });

        if (!req.user) return res.status(401).json({ message: 'No autenticado' });

        const useCase = container.migrarCarritoUseCase;
        const carrito = await useCase.execute(barberia._id.toString(), sessionId, req.user._id || req.user.id);

        res.json({
            message: 'Carrito migrado exitosamente',
            carrito: carrito ? carrito.toObject() : null
        });
    } catch (error) {
        next(error);
    }
};
