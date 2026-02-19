const Barberia = require('../../../domain/entities/Barberia');
const Slug = require('../../../domain/value-objects/Slug');

/**
 * Approve Account Use Case
 * SuperAdmin approves a pending account and creates associated barberia
 */
class ApproveAccount {
    constructor(userRepository, barberiaRepository, emailService) {
        this.userRepository = userRepository;
        this.barberiaRepository = barberiaRepository;
        this.emailService = emailService;
    }

    async execute(userId, approvedBy) {
        // 1. Find user (SuperAdmin can access any user)
        const users = await this.userRepository.findByStatus('PENDIENTE');
        const user = users.find(u => u.id === userId);

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // 2. Check if already approved
        if (user.estadoCuenta === 'ACTIVA') {
            throw new Error('La cuenta ya está activa');
        }

        // 3. Create Barberia with user's name
        const nombreBarberia = user.nombre;

        // Generate slug from barberia name
        let slug = Slug.normalize(nombreBarberia);

        // Ensure slug is unique
        let slugExists = await this.barberiaRepository.findBySlug(slug);
        let counter = 1;
        while (slugExists) {
            slug = `${Slug.normalize(nombreBarberia)}-${counter}`;
            slugExists = await this.barberiaRepository.findBySlug(slug);
            counter++;
        }

        // Create barberia entity
        const barberia = new Barberia({
            nombre: nombreBarberia,
            slug: slug,
            email: user.email,
            telefono: '',
            direccion: '',
            estado: 'trial',
            planActual: 'basico',
            fechaFinTrial: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
            proximoPago: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        const savedBarberia = await this.barberiaRepository.save(barberia);

        // 4. Update user status and associate with barberia
        const updatedUser = await this.userRepository.updateById(userId, {
            estadoCuenta: 'ACTIVA',
            fechaAprobacion: new Date(),
            aprobadoPor: approvedBy,
            barberiaId: savedBarberia.id,
            rol: 'BARBERIA_ADMIN'
        });

        // 5. Update ApprovalRequest for audit trail
        try {
            const ApprovalRequest = require('../../../infrastructure/database/mongodb/models/ApprovalRequest');
            await ApprovalRequest.findOneAndUpdate(
                { userId: userId, status: 'PENDING' },
                {
                    status: 'APPROVED',
                    reviewedAt: new Date(),
                    reviewedBy: approvedBy,
                    barberiaId: savedBarberia.id
                }
            );
        } catch (auditError) {
            console.error('❌ Error actualizando ApprovalRequest:', auditError);
            // Don't fail the approval if audit update fails
        }

        // 6. Send approval email
        try {
            await this.emailService.sendAccountApprovedEmail({
                email: updatedUser.email,
                nombre: nombreBarberia,
                slug: savedBarberia.slug
            });
        } catch (emailError) {
            console.error('❌ Error enviando email de aprobación:', emailError);
            // Don't fail the approval if email fails
        }

        return {
            user: updatedUser,
            barberia: savedBarberia
        };
    }
}

module.exports = ApproveAccount;
