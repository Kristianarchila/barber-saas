/**
 * ListProveedores Use Case
 */
class ListProveedores {
    constructor(proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }

    async execute(barberiaId, filtros = {}) {
        return await this.proveedorRepository.findAll({
            barberiaId,
            activo: filtros.activo === "true" ? true : (filtros.activo === "false" ? false : undefined)
        });
    }
}

module.exports = ListProveedores;
