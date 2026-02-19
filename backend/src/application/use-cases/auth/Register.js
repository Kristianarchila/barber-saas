const User = require('../../../domain/entities/User');
const emailService = require('../../../notifications/emailService');

/**
 * Register Use Case
 */
class Register {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(data) {
        const { nombre, email, password } = data;

        // 1. Validation
        if (!nombre || !email || !password) {
            throw new Error('Datos incompletos');
        }

        // 2. Check if user exists
        const exists = await this.userRepository.findByEmail(email);
        if (exists) {
            throw new Error('Email ya registrado');
        }

        // 3. Public registration always creates BARBERIA_ADMIN with PENDIENTE status
        // - Role is always BARBERIA_ADMIN (barberia owner)
        // - estadoCuenta is always PENDIENTE (requires SuperAdmin approval)
        // - barberiaId is null until approved
        const userRol = 'BARBERIA_ADMIN';
        const estadoCuenta = 'PENDIENTE';

        // 4. Create User entity
        const user = new User({
            nombre,
            email,
            password,
            rol: userRol,
            barberiaId: null, // Assigned after SuperAdmin approval
            estadoCuenta
        });

        // 5. Save
        const savedUser = await this.userRepository.save(user);

        // 6. Create ApprovalRequest for audit trail (if PENDIENTE)
        if (estadoCuenta === 'PENDIENTE') {
            try {
                const ApprovalRequest = require('../../../infrastructure/database/mongodb/models/ApprovalRequest');
                await ApprovalRequest.create({
                    userId: savedUser.id,
                    status: 'PENDING',
                    ipAddress: data.ipAddress || null,
                    userAgent: data.userAgent || null,
                    metadata: {
                        registrationType: 'public',
                        timestamp: new Date()
                    }
                });
            } catch (auditError) {
                console.error('❌ Error creando ApprovalRequest:', auditError);
                // No fallar el registro si la auditoría falla
            }

            // 7. Send welcome email
            try {
                await emailService.sendWelcomePendingEmail({
                    email: savedUser.email,
                    nombre: savedUser.nombre
                });
            } catch (emailError) {
                console.error('❌ Error enviando email de bienvenida:', emailError);
                // No fallar el registro si el email falla
            }
        }

        return savedUser;
    }
}

module.exports = Register;
