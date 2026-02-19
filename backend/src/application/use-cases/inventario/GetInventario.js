/**
 * GetInventario Use Case
 */
class GetInventario {
    constructor(inventarioRepository) {
        this.inventarioRepository = inventarioRepository;
    }

    async execute(barberiaId, filtros = {}) {
        const repoFilters = {
            activo: filtros.activo === "true" ? true : (filtros.activo === "false" ? false : undefined)
        };

        let inventario = await this.inventarioRepository.findByBarberiaId(barberiaId, repoFilters);

        if (filtros.bajoStock === "true") {
            inventario = inventario.filter(item => item.bajoPuntoReorden);
        }

        return inventario;
    }
}

module.exports = GetInventario;
