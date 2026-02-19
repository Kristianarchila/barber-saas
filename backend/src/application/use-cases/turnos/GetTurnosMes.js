/**
 * GetTurnosMes Use Case
 * Returns monthly statistics for a specific barber
 */
class GetTurnosMes {
    constructor(reservaRepository, servicioRepository) {
        this.reservaRepository = reservaRepository;
        this.servicioRepository = servicioRepository;
    }

    async execute(barberoId, fecha, authenticatedBarberiaId) {
        if (!fecha) {
            throw new Error("La fecha es obligatoria");
        }

        // Ideally we'd have a barberoRepository here, but we have reservaRepository and servicioRepository.
        // We can use reservaRepository to check if there are any reservations for this barber in this barberia,
        // but it's better to inject BarberoRepository or use the passed barberoId if it's already filtered by middleware.
        // However, middleware filters the ROUTE, but the use case should be safe.
        // Let's assume we can at least filter the results by barberiaId in the query.

        const filter = {
            barberoId,
            fechaInicio: inicio,
            fechaFin: fin
        };

        if (authenticatedBarberiaId) {
            filter.barberiaId = authenticatedBarberiaId;
        }

        const reservas = await this.reservaRepository.findAll(null, filter);

        let totalMinutos = 0;
        let totalPrecio = 0;
        const serviciosCount = {};

        for (const reserva of reservas) {
            const servicioNombre = reserva.servicioNombre;
            const servicioDuracion = reserva.servicioDuracion || 0;
            const servicioPrecio = reserva.precio || 0;

            if (reserva.estado === "COMPLETADA") {
                totalMinutos += servicioDuracion;
                totalPrecio += servicioPrecio;
            }

            if (servicioNombre) {
                serviciosCount[servicioNombre] = (serviciosCount[servicioNombre] || 0) + 1;
            }
        }

        const servicioMasVendido =
            Object.entries(serviciosCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

        return {
            barberoId,
            mes: fechaObj.format("YYYY-MM"),
            resumen: {
                totalTurnos: reservas.length,
                completados: reservas.filter(r => r.estado === "COMPLETADA").length,
                cancelados: reservas.filter(r => r.estado === "CANCELADA").length,
                reservados: reservas.filter(r => r.estado === "RESERVADA").length,
                ingresosGenerados: totalPrecio,
                horasTrabajadas: this.convertToHoras(totalMinutos),
                servicioMasVendido
            }
        };
    }

    convertToHoras(mins) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
}

module.exports = GetTurnosMes;
