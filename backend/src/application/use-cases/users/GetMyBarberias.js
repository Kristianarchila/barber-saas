/**
 * GetMyBarberias Use Case
 */
class GetMyBarberias {
    constructor(userRepository, barberiaRepository) {
        this.userRepository = userRepository;
        this.barberiaRepository = barberiaRepository;
    }

    async execute(userId) {
        const user = await this.userRepository.findOne({ _id: userId });
        if (!user) throw new Error('Usuario no encontrado');

        // Combined barberiaIds and legacy single barberiaId
        const ids = [...new Set([
            ...user.barberiaIds,
            ...(user.barberiaId ? [user.barberiaId] : [])
        ])];

        const barberias = await Promise.all(
            ids.map(id => this.barberiaRepository.findById(id))
        );

        return barberias.filter(Boolean);
    }
}

module.exports = GetMyBarberias;
