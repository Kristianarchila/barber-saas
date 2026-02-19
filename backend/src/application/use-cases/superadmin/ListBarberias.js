/**
 * ListBarberias Use Case
 * Returns paginated list of barberias with filters
 */
class ListBarberias {
    constructor(barberiaRepository, userRepository, barberoRepository, reservaRepository) {
        this.barberiaRepository = barberiaRepository;
        this.userRepository = userRepository;
        this.barberoRepository = barberoRepository;
        this.reservaRepository = reservaRepository;
    }

    async execute(filters = {}, pagination = {}) {
        const { page = 1, limit = 10 } = pagination;

        // Get barberias with filters
        const barberias = await this.barberiaRepository.findAll(filters, pagination);

        // Get total count for pagination
        const total = await this.barberiaRepository.count(filters);

        // Enrich each barberia with admin and stats
        const barberiasEnriquecidas = await Promise.all(
            barberias.map(async (barberia) => {
                const barberiaObj = barberia.toObject();

                // Get admin user
                const admin = await this.userRepository.findOne({
                    barberiaId: barberiaObj.id,
                    rol: 'BARBERIA_ADMIN'
                });

                // Get stats
                const [totalBarberos, totalReservas] = await Promise.all([
                    this.barberoRepository.countByBarberiaId(barberiaObj.id),
                    this.reservaRepository.count(barberiaObj.id, {})
                ]);

                return {
                    _id: barberiaObj.id, // Add _id for frontend compatibility
                    ...barberiaObj,
                    admin: admin ? {
                        nombre: admin.nombre,
                        email: admin.email,
                        telefono: admin.telefono,
                        activo: admin.activo
                    } : null,
                    stats: {
                        totalBarberos,
                        totalReservas
                    }
                };
            })
        );

        return {
            barberias: barberiasEnriquecidas,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }
}

module.exports = ListBarberias;
