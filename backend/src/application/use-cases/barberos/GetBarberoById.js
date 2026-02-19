/**
 * GetBarberoById Use Case
 * Retrieves a single barber by ID
 */
class GetBarberoById {
    constructor(barberoRepository) {
        this.barberoRepository = barberoRepository;
    }

    async execute(id, barberiaId) {
        const barbero = await this.barberoRepository.findById(id);
        if (!barbero || (barberiaId && barbero.barberiaId !== barberiaId)) {
            throw new Error('Barbero no encontrado');
        }
        return barbero;
    }
}

module.exports = GetBarberoById;
