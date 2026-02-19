/**
 * ListBarberos Use Case
 * Retrieves all barbers for a barber shop
 */
class ListBarberos {
    constructor(barberoRepository) {
        this.barberoRepository = barberoRepository;
    }

    async execute(barberiaId, options = {}) {
        return await this.barberoRepository.findByBarberiaId(barberiaId, {
            populateUser: true,
            onlyActive: options.onlyActive || false
        });
    }
}

module.exports = ListBarberos;
