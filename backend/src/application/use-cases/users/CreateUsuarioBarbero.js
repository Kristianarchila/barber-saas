const User = require('../../../domain/entities/User');

/**
 * CreateUsuarioBarbero Use Case
 */
class CreateUsuarioBarbero {
    constructor(userRepository, barberoRepository) {
        this.userRepository = userRepository;
        this.barberoRepository = barberoRepository;
    }

    async execute(data) {
        const { nombre, email, password, barberoId, barberiaId } = data;

        if (!nombre || !email || !password || !barberoId) {
            throw new Error('Datos incompletos');
        }

        // 1. Verify barbero exists
        const barbero = await this.barberoRepository.findById(barberoId, barberiaId);
        if (!barbero) {
            throw new Error('Barbero no encontrado');
        }

        // 2. Create User Entity
        const user = new User({
            nombre,
            email,
            password,
            rol: 'BARBERO',
            barberiaId: barbero.barberiaId,
            barberoId: barbero.id
        });

        // 3. Save User
        const savedUser = await this.userRepository.save(user);

        // 4. Update Barbero to link to User
        await this.barberoRepository.update(barbero.id, { usuario: savedUser.id });

        return savedUser;
    }
}

module.exports = CreateUsuarioBarbero;
