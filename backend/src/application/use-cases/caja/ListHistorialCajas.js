/**
 * ListHistorialCajas Use Case
 */
class ListHistorialCajas {
    constructor(cajaRepository) {
        this.cajaRepository = cajaRepository;
    }

    async execute(barberiaId, filtros = {}) {
        const cajas = await this.cajaRepository.findAll({
            barberiaId,
            estado: 'CERRADA',
            ...filtros
        });

        // Calculate basic stats for the results
        const totalCajas = cajas.length;
        const cajasDescuadradas = cajas.filter(c => c.tieneDescuadre).length;
        const totalDiferencias = cajas.reduce((sum, c) => sum + (c.diferencia || 0), 0);

        return {
            cajas,
            estadisticas: {
                totalCajas,
                cajasDescuadradas,
                porcentajeDescuadre: totalCajas > 0 ? Math.round((cajasDescuadradas / totalCajas) * 100) : 0,
                totalDiferencias
            }
        };
    }
}

module.exports = ListHistorialCajas;
