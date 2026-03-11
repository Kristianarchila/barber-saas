const MovimientoStock = require('../../../domain/entities/MovimientoStock');

/**
 * RegistrarMovimiento Use Case
 */
class RegistrarMovimiento {
    constructor(inventarioRepository, movimientoRepository) {
        this.inventarioRepository = inventarioRepository;
        this.movimientoRepository = movimientoRepository;
    }

    async execute(inventarioId, barberiaId, data, usuarioId) {
        const { tipo, cantidad, motivo, observaciones, proveedorId, costoUnitario } = data;

        // 1. Fetch current inventory to get productoId
        const inventario = await this.inventarioRepository.findById(inventarioId);
        if (!inventario || inventario.barberiaId !== barberiaId) {
            throw new Error('Inventario no encontrado');
        }

        // 2. Delegate to unified registrarMovimientoStock
        return await this.inventarioRepository.registrarMovimientoStock({
            barberiaId,
            productoId: inventario.productoId,
            tipo,
            cantidad,
            motivo,
            referenciaId: null, // No order reference for manual movements
            usuarioId
        });
    }
}

module.exports = RegistrarMovimiento;
