/**
 * DeleteProveedor Use Case
 */
class DeleteProveedor {
    constructor(proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }

    async execute(id, barberiaId) {
        const proveedor = await this.proveedorRepository.findById(id);
        if (!proveedor || proveedor.barberiaId !== barberiaId) {
            throw new Error('Proveedor no encontrado');
        }

        return await this.proveedorRepository.update(id, { activo: false });
    }
}

module.exports = DeleteProveedor;
