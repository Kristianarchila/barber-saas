/**
 * GetMiPerfil Use Case
 * Retrieves the profile of the current barber
 */
class GetMiPerfil {
    constructor(barberoRepository) {
        this.barberoRepository = barberoRepository;
    }

    async execute(usuarioId, barberiaId) {
        const barbero = await this.barberoRepository.findByUsuarioId(usuarioId, barberiaId);
        if (!barbero) {
            throw new Error('Barbero no encontrado');
        }
        return barbero;
    }
}

module.exports = GetMiPerfil;
