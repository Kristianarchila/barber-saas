/**
 * UpdateProveedor Use Case
 */
class UpdateProveedor {
    constructor(proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }

    async execute(id, barberiaId, data) {
        const proveedor = await this.proveedorRepository.findById(id);
        if (!proveedor || proveedor.barberiaId !== barberiaId) {
            throw new Error('Proveedor no encontrado');
        }

        return await this.proveedorRepository.update(id, data);
    }
}

module.exports = UpdateProveedor;
