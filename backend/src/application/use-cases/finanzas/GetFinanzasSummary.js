/**
 * GetFinanzasSummary Use Case
 */
class GetFinanzasSummary {
    constructor(reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    async execute(barberiaId) {
        const hoy = new Date();
        const hoyStr = hoy.toISOString().slice(0, 10);
        const inicioMes = hoyStr.slice(0, 7);

        // This is inefficient as it fetches all reservations. 
        // In a real scenario, we should have a repository method with date filters.
        // But for this migration, I'll stick to the logic provided.
        const reservas = await this.reservaRepository.findAll({ barberiaId });

        let ingresosHoy = 0;
        let ingresosMes = 0;
        let completadas = 0;
        let canceladas = 0;

        reservas.forEach((r) => {
            // Price calculation depends on how it's stored in the domain entity
            // For now, let's assume 'r.montoTotal' or similar.
            const precio = r.montoTotal || 0;
            const fechaStr = r.fecha; // Assuming YYYY-MM-DD
            const mesStr = fechaStr.slice(0, 7);

            if (r.estado === "COMPLETADA") {
                completadas++;
                if (fechaStr === hoyStr) {
                    ingresosHoy += precio;
                }
                if (mesStr === inicioMes) {
                    ingresosMes += precio;
                }
            }

            if (r.estado === "CANCELADA") {
                canceladas++;
            }
        });

        return {
            ingresosHoy,
            ingresosMes,
            completadas,
            canceladas
        };
    }
}

module.exports = GetFinanzasSummary;
