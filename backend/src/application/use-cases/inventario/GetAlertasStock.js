/**
 * GetAlertasStock Use Case
 */
class GetAlertasStock {
    constructor(inventarioRepository) {
        this.inventarioRepository = inventarioRepository;
    }

    async execute(barberiaId) {
        const inventario = await this.inventarioRepository.findByBarberiaId(barberiaId, { activo: true });
        const alertas = inventario.filter(item => item.bajoPuntoReorden);

        return {
            alertas,
            total: alertas.length
        };
    }
}

module.exports = GetAlertasStock;
