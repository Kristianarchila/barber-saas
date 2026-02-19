/**
 * ListBarberias Use Case
 */
class ListBarberias {
    constructor(barberiaRepository) {
        this.barberiaRepository = barberiaRepository;
    }

    async execute() {
        return await this.barberiaRepository.findAll();
    }
}

module.exports = ListBarberias;
