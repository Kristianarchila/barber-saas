const User = require('../../../domain/entities/User');

/**
 * CreateBarberiaAdmin Use Case
 */
class CreateBarberiaAdmin {
    constructor(userRepository, barberiaRepository) {
        this.userRepository = userRepository;
        this.barberiaRepository = barberiaRepository;
    }

    async execute(data) {
        const { nombre, email, password, barberiaId } = data;

        if (!nombre || !email || !password || !barberiaId) {
            throw new Error('Datos incompletos');
        }

        // 1. Verify barberia exists
        const barberia = await this.barberiaRepository.findById(barberiaId);
        if (!barberia) {
            throw new Error('Barbería no encontrada');
        }

        // 2. Create User Entity
        const user = new User({
            nombre,
            email,
            password,
            rol: 'BARBERIA_ADMIN',
            barberiaId,
            barberiaIds: [barberiaId]
        });

        // 3. Save
        return await this.userRepository.save(user);
    }
}

module.exports = CreateBarberiaAdmin;
