/**
 * GetProveedor Use Case
 */
class GetProveedor {
    constructor(proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }

    async execute(id, barberiaId) {
        const proveedor = await this.proveedorRepository.findById(id);
        if (!proveedor || proveedor.barberiaId !== barberiaId) {
            throw new Error('Proveedor no encontrado');
        }
        return proveedor;
    }
}

module.exports = GetProveedor;
