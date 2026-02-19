const Barbero = require('../../../domain/entities/Barbero');

/**
 * CreateBarbero Use Case
 * Orchestrates the creation of a user and a barbero
 */
class CreateBarbero {
    constructor(barberoRepository, userRepository) {
        this.barberoRepository = barberoRepository;
        this.userRepository = userRepository;
    }

    async execute(data) {
        const {
            nombre,
            email,
            password,
            foto,
            descripcion,
            especialidades,
            experiencia,
            barberiaId
        } = data;

        // 1. Validation
        if (!nombre || !email || !password) {
            throw new Error('Nombre, email y contraseña son obligatorios');
        }

        // 2. Check if email exists
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('Email ya registrado');
        }

        // 3. Create User
        const userData = {
            nombre,
            email,
            password,
            rol: 'BARBERO',
            barberiaId,
            activo: true
        };

        const user = await this.userRepository.save(userData);

        try {
            // 4. Create Barbero
            const barberoEntity = new Barbero({
                usuarioId: user.id,
                nombre,
                foto: foto || '',
                descripcion: descripcion || '',
                especialidades: especialidades || [],
                experiencia: experiencia || 0,
                barberiaId,
                activo: true
            });

            const savedBarbero = await this.barberoRepository.save(barberoEntity);

            // 5. Link user to barbero (optional but good for consistency)
            await this.userRepository.update(user.id, { barberoId: savedBarbero.id }, barberiaId);

            return savedBarbero;
        } catch (error) {
            // Rollback user creation if barbero fails
            await this.userRepository.delete(user.id, barberiaId);
            throw error;
        }
    }
}

module.exports = CreateBarbero;
