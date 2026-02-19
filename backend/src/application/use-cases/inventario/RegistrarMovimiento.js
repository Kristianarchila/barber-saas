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

        // 1. Fetch current inventory
        const inventario = await this.inventarioRepository.findById(inventarioId);
        if (!inventario || inventario.barberiaId !== barberiaId) {
            throw new Error('Inventario no encontrado');
        }

        const cantidadAnterior = inventario.cantidadActual;
        let cantidadNueva;

        // 2. Logic to calculate new quantity
        switch (tipo) {
            case "entrada":
            case "devolucion":
                cantidadNueva = cantidadAnterior + cantidad;
                break;
            case "salida":
            case "venta":
                cantidadNueva = cantidadAnterior - cantidad;
                if (cantidadNueva < 0) throw new Error("Stock insuficiente");
                break;
            case "ajuste":
                cantidadNueva = cantidad;
                break;
            default:
                throw new Error("Tipo de movimiento inválido");
        }

        // 3. Create Movimiento Entity
        const movimiento = new MovimientoStock({
            productoId: inventario.productoId,
            inventarioId: inventario.id,
            barberiaId: barberiaId,
            tipo,
            cantidad: tipo === "ajuste" ? Math.abs(cantidadNueva - cantidadAnterior) : cantidad,
            cantidadAnterior,
            cantidadNueva,
            motivo,
            observaciones,
            proveedorId,
            usuarioId,
            costoUnitario,
            costoTotal: costoUnitario ? costoUnitario * cantidad : undefined
        });

        // 4. Update Inventario and Save Movimiento
        await this.inventarioRepository.update(inventarioId, { cantidadActual: cantidadNueva });
        return await this.movimientoRepository.save(movimiento);
    }
}

module.exports = RegistrarMovimiento;
