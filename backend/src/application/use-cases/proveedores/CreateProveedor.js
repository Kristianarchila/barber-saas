const Proveedor = require('../../../domain/entities/Proveedor');

/**
 * CreateProveedor Use Case
 */
class CreateProveedor {
    constructor(proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }

    async execute(barberiaId, data) {
        const proveedor = new Proveedor({
            ...data,
            barberiaId
        });
        return await this.proveedorRepository.save(proveedor);
    }
}

module.exports = CreateProveedor;
