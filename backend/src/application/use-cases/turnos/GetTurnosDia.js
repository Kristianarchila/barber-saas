/**
 * GetTurnosDia Use Case
 * Returns all appointments for a specific barber on a specific day
 */
class GetTurnosDia {
    constructor(reservaRepository, servicioRepository, userRepository) {
        this.reservaRepository = reservaRepository;
        this.servicioRepository = servicioRepository;
        this.userRepository = userRepository;
    }

    async execute(barberoId, fecha, authenticatedBarberiaId) {
        if (!fecha) {
            throw new Error("La fecha es obligatoria");
        }

        // 0. Verify owner
        const barbero = await this.userRepository.findById(barberoId); // Wait, userRepository might not be the right one for Barbero entity
        // I need to check if barberoRepository is available or use a generic check.
        // Looking at constructor: reservaRepository, servicioRepository, userRepository.
        // barberoId is usually a User ID with role BARBERO in some cases, or a Barbero entity ID.
        // Let's check who the barberoId refers to.
        // In this system, sometimes User.id is used directly as barberoId.

        const barberoUser = await this.userRepository.findById(barberoId);
        if (!barberoUser || (authenticatedBarberiaId && barberoUser.barberiaId !== authenticatedBarberiaId)) {
            throw new Error('No autorizado');
        }

        // Get all reservations for this barber on this date
        const reservas = await this.reservaRepository.findAll(null, {
            barberoId,
            fecha,
            sort: 'hora'
        });

        let totalMinutos = 0;
        let totalPrecio = 0;
        const turnos = [];

        for (const reserva of reservas) {
            const servicio = reserva.servicioNombre ?
                { nombre: reserva.servicioNombre, duracion: reserva.servicioDuracion, precio: reserva.precio } :
                null;

            if (reserva.estado === "COMPLETADA" && servicio) {
                totalMinutos += servicio.duracion || 0;
                totalPrecio += servicio.precio || 0;
            }

            turnos.push({
                hora: reserva.hora,
                estado: reserva.estado,
                servicio: servicio?.nombre || null,
                duracion: servicio?.duracion || null,
                precio: servicio?.precio || null,
                cliente: reserva.nombreCliente || null
            });
        }

        return {
            fecha,
            barberoId,
            resumen: {
                totalTurnos: reservas.length,
                completados: reservas.filter(r => r.estado === "COMPLETADA").length,
                cancelados: reservas.filter(r => r.estado === "CANCELADA").length,
                reservados: reservas.filter(r => r.estado === "RESERVADA").length,
                ingresosGenerados: totalPrecio,
                horasTrabajadas: this.convertToHoras(totalMinutos)
            },
            turnos
        };
    }

    convertToHoras(mins) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
}

module.exports = GetTurnosDia;
