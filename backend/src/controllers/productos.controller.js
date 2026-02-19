/**
 * Productos Controller (Hexagonal Architecture Version)
 * Acts as an adapter in the interfaces layer
 */
const container = require('../shared/Container');

// ==========================================
// 1) OBTENER PRODUCTOS (PÚBLICO)
// ==========================================
exports.obtenerProductos = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const useCase = container.listProductosUseCase;
        const result = await useCase.execute(slug, req.query);

        res.json({
            productos: result.productos.map(p => p.toObject()),
            paginacion: result.paginacion
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2) OBTENER PRODUCTO ESPECÍFICO
// ==========================================
exports.obtenerProducto = async (req, res, next) => {
    try {
        const { slug, id } = req.params;
        const useCase = container.getProductoByIdUseCase;
        const producto = await useCase.execute(slug, id);

        res.json(producto.toObject());
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3) CREAR PRODUCTO (ADMIN)
// ==========================================
exports.crearProducto = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const barberiaId = req.user.barberiaId;
        const useCase = container.createProductoUseCase;

        const producto = await useCase.execute(slug, req.body, barberiaId);

        res.status(201).json({
            message: 'Producto creado exitosamente',
            producto: producto.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4) ACTUALIZAR PRODUCTO (ADMIN)
// ==========================================
exports.actualizarProducto = async (req, res, next) => {
    try {
        const { id } = req.params;
        const barberiaId = req.user.barberiaId;
        const useCase = container.updateProductoUseCase;

        const producto = await useCase.execute(id, barberiaId, req.body);

        res.json({
            message: 'Producto actualizado exitosamente',
            producto: producto.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5) ACTUALIZAR STOCK (ADMIN)
// ==========================================
exports.actualizarStock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { cantidad } = req.body;
        const barberiaId = req.user.barberiaId;
        const useCase = container.updateStockUseCase;

        const producto = await useCase.execute(id, barberiaId, cantidad);

        res.json({
            message: 'Stock actualizado exitosamente',
            producto: producto.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 6) ELIMINAR PRODUCTO (ADMIN)
// ==========================================
exports.eliminarProducto = async (req, res, next) => {
    try {
        const { id } = req.params;
        const barberiaId = req.user.barberiaId;
        const useCase = container.deleteProductoUseCase;

        await useCase.execute(id, barberiaId);

        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 7) OBTENER POR CATEGORÍA
// ==========================================
exports.obtenerPorCategoria = async (req, res, next) => {
    try {
        const { slug, categoria } = req.params;
        const useCase = container.listProductosUseCase;
        const result = await useCase.execute(slug, { ...req.query, categoria });

        res.json({
            productos: result.productos.map(p => p.toObject()),
            paginacion: result.paginacion
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 8) OBTENER DESTACADOS
// ==========================================
exports.obtenerDestacados = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const useCase = container.listProductosUseCase;

        // Custom filters for featured
        const result = await useCase.execute(slug, {
            destacado: true,
            limite: req.query.limite || 8,
            ordenar: '-metadata.ventas'
        });

        res.json(result.productos.map(p => p.toObject()));
    } catch (error) {
        next(error);
    }
};
