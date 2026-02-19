const Inventario = require('../../../domain/entities/Inventario');
const MovimientoStock = require('../../../domain/entities/MovimientoStock');

/**
 * CreateInventario Use Case
 */
class CreateInventario {
    constructor(inventarioRepository, movimientoRepository, productoRepository) {
        this.inventarioRepository = inventarioRepository;
        this.movimientoRepository = movimientoRepository;
        this.productoRepository = productoRepository;
    }

    async execute(barberiaId, data, usuarioId) {
        const { productoId, cantidadInicial = 0, stockMinimo, stockMaximo, ubicacion, unidadMedida } = data;

        // 1. Verify product and ownership
        const producto = await this.productoRepository.findById(productoId);
        if (!producto || producto.barberiaId !== barberiaId) {
            throw new Error("Producto no encontrado o no autorizado");
        }

        // 2. Check existence
        const existente = await this.inventarioRepository.findByProductoId(productoId, barberiaId);
        if (existente) throw new Error("Ya existe inventario para este producto");

        // 3. Create Entity
        const inventario = new Inventario({
            productoId,
            barberiaId,
            cantidadActual: cantidadInicial,
            stockMinimo,
            stockMaximo,
            ubicacion,
            unidadMedida
        });

        const savedInventario = await this.inventarioRepository.save(inventario);

        // 4. Initial Movement if quantity > 0
        if (cantidadInicial > 0) {
            const movimiento = new MovimientoStock({
                productoId,
                inventarioId: savedInventario.id,
                barberiaId,
                tipo: "entrada",
                cantidad: cantidadInicial,
                cantidadAnterior: 0,
                cantidadNueva: cantidadInicial,
                motivo: "Stock inicial",
                usuarioId
            });
            await this.movimientoRepository.save(movimiento);
        }

        return savedInventario;
    }
}

module.exports = CreateInventario;
