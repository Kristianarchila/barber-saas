/**
 * GetBarberiaBySlug Use Case
 */
class GetBarberiaBySlug {
    constructor(barberiaRepository) {
        this.barberiaRepository = barberiaRepository;
    }

    async execute(slug) {
        const barberia = await this.barberiaRepository.findBySlug(slug.toLowerCase());

        if (!barberia || !barberia.activa) {
            throw new Error('Barbería no encontrada');
        }

        if (barberia.estado === 'suspendida') {
            throw new Error('Esta barbería no está disponible actualmente');
        }

        return barberia;
    }
}

module.exports = GetBarberiaBySlug;
