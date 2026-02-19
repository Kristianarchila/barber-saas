/**
 * GetBarberiaDetails Use Case
 * Returns complete details of a barberia including admin and stats
 */
class GetBarberiaDetails {
    constructor(barberiaRepository, userRepository, barberoRepository, reservaRepository) {
        this.barberiaRepository = barberiaRepository;
        this.userRepository = userRepository;
        this.barberoRepository = barberoRepository;
        this.reservaRepository = reservaRepository;
    }

    async execute(barberiaId) {
        // Get barberia
        const barberia = await this.barberiaRepository.findById(barberiaId);
        if (!barberia) {
            throw new Error('Barbería no encontrada');
        }

        const barberiaObj = barberia.toObject();

        // Get admin user
        const admin = await this.userRepository.findOne({
            barberiaId: barberiaObj.id,
            rol: 'BARBERIA_ADMIN'
        });

        // Get detailed stats
        const [totalBarberos, totalReservas, reservasCompletadas, barberos] = await Promise.all([
            this.barberoRepository.count({ barberiaId: barberiaObj.id }),
            this.reservaRepository.count({ barberiaId: barberiaObj.id }),
            this.reservaRepository.count({ barberiaId: barberiaObj.id, estado: 'COMPLETADA' }),
            this.barberoRepository.findAll({ barberiaId: barberiaObj.id }, { limit: 10 })
        ]);

        return {
            ...barberiaObj,
            admin: admin ? {
                nombre: admin.nombre,
                email: admin.email,
                telefono: admin.telefono,
                activo: admin.activo
            } : null,
            stats: {
                totalBarberos,
                totalReservas,
                reservasCompletadas,
                barberos: barberos.map(b => ({
                    nombre: b.nombre,
                    activo: b.activo
                }))
            }
        };
    }
}

module.exports = GetBarberiaDetails;
