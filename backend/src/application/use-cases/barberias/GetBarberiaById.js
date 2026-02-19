/**
 * GetBarberiaById Use Case
 */
class GetBarberiaById {
    constructor(barberiaRepository) {
        this.barberiaRepository = barberiaRepository;
    }

    async execute(id) {
        const barberia = await this.barberiaRepository.findById(id);
        if (!barberia) throw new Error('Barbería no encontrada');
        return barberia;
    }
}

module.exports = GetBarberiaById;
