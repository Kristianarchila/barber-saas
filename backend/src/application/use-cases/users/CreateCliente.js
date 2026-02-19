const User = require('../../../domain/entities/User');

/**
 * CreateCliente Use Case
 */
class CreateCliente {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(data) {
        const { nombre, email, password, barberiaId } = data;

        if (!nombre || !email || !password) {
            throw new Error('Nombre, email y contraseña son obligatorios');
        }

        // 1. Check if exists
        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
            throw new Error('El email ya está registrado');
        }

        // 2. Create Entity
        const user = new User({
            nombre,
            email,
            password,
            rol: 'CLIENTE',
            barberiaId,
            barberiaIds: [barberiaId]
        });

        // 3. Save
        return await this.userRepository.save(user);
    }
}

module.exports = CreateCliente;
