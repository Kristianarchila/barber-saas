/**
 * Proveedores Controller (Hexagonal Architecture Version)
 * Acts as an adapter in the interfaces layer
 */
const container = require('../shared/Container');

// ==========================================
// 1) OBTENER TODOS LOS PROVEEDORES
// ==========================================
exports.getProveedores = async (req, res, next) => {
    try {
        const barberia = req.barberia;
        const useCase = container.listProveedoresUseCase;
        const proveedores = await useCase.execute(barberia._id.toString(), req.query);

        res.json({ proveedores: proveedores.map(p => p.toObject()) });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2) OBTENER PROVEEDOR POR ID
// ==========================================
exports.getProveedor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const barberia = req.barberia;
        const useCase = container.getProveedorUseCase;
        const proveedor = await useCase.execute(id, barberia._id.toString());

        res.json({ proveedor: proveedor.toObject() });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3) CREAR PROVEEDOR
// ==========================================
exports.createProveedor = async (req, res, next) => {
    try {
        const barberia = req.barberia;
        const useCase = container.createProveedorUseCase;
        const proveedor = await useCase.execute(barberia._id.toString(), req.body);

        res.status(201).json({ proveedor: proveedor.toObject() });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4) ACTUALIZAR PROVEEDOR
// ==========================================
exports.updateProveedor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const barberia = req.barberia;
        const useCase = container.updateProveedorUseCase;
        const proveedor = await useCase.execute(id, barberia._id.toString(), req.body);

        res.json({ proveedor: proveedor.toObject() });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5) ELIMINAR PROVEEDOR
// ==========================================
exports.deleteProveedor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const barberia = req.barberia;
        const useCase = container.deleteProveedorUseCase;

        await useCase.execute(id, barberia._id.toString());

        res.json({ message: "Proveedor desactivado exitosamente" });
    } catch (error) {
        next(error);
    }
};
