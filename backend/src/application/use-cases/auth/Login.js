/**
 * Login Use Case
 */
class Login {
    constructor(userRepository, passwordService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
    }

    async execute(email, password, options = {}) {
        if (!email || !password) {
            throw new Error('Datos incompletos');
        }

        // 1. Find user by email (includes password)
        const user = await this.userRepository.findByEmail(email, options);

        if (!user || !user.activo) {
            throw new Error('Credenciales inválidas');
        }

        // 2. Check account status
        if (user.estadoCuenta === 'PENDIENTE') {
            throw new Error('Tu cuenta está pendiente de aprobación. Recibirás un email cuando sea activada.');
        }

        if (user.estadoCuenta === 'RECHAZADA') {
            throw new Error('Tu solicitud de cuenta fue rechazada. Contacta a soporte para más información.');
        }

        if (user.estadoCuenta === 'SUSPENDIDA') {
            throw new Error('Tu cuenta ha sido suspendida. Contacta a soporte.');
        }

        // 3. Compare password
        const isPasswordCorrect = await this.passwordService.compare(password, user.password);
        if (!isPasswordCorrect) {
            throw new Error('Credenciales inválidas');
        }

        return user;
    }
}

module.exports = Login;
