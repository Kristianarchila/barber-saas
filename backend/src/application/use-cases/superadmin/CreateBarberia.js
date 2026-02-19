const Barberia = require('../../../domain/entities/Barberia');
const Slug = require('../../../domain/value-objects/Slug');
const TransactionManager = require('../../../utils/TransactionManager');
const bcrypt = require('bcrypt');

/**
 * CreateBarberia Use Case
 * Creates a new barberia with admin user in a transaction
 */
class CreateBarberia {
    constructor(barberiaRepository, userRepository, emailService) {
        this.barberiaRepository = barberiaRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    async execute(dto, currentUserId) {
        const {
            // Barberia data
            nombre,
            slug,
            email,
            telefono,
            rut,
            direccion,
            plan = 'basico',
            diasTrial = 14,
            // Admin data
            adminNombre,
            adminEmail,
            adminPassword,
            adminTelefono
        } = dto;

        // Validate required fields
        if (!nombre || !slug || !email || !adminNombre || !adminEmail || !adminPassword) {
            throw new Error('Faltan campos requeridos');
        }

        // Normalize and validate slug
        const slugNormalizado = Slug.normalize(slug);
        if (!slugNormalizado) {
            throw new Error('Slug inválido');
        }

        // Check slug uniqueness
        const slugExists = await this.barberiaRepository.exists({ slug: slugNormalizado });
        if (slugExists) {
            throw new Error('El slug ya está en uso');
        }

        // Check barberia email uniqueness
        const emailBarberia = email.toLowerCase().trim();
        const emailBarberiaExists = await this.barberiaRepository.findByEmail(emailBarberia);
        if (emailBarberiaExists) {
            throw new Error('El email de la barbería ya está en uso');
        }

        // Check admin email uniqueness
        const adminEmailNorm = adminEmail.toLowerCase().trim();
        const adminEmailExists = await this.userRepository.findByEmail(adminEmailNorm);
        if (adminEmailExists) {
            throw new Error('El email del administrador ya está registrado');
        }

        // Calculate trial end date
        const fechaFinTrial = new Date();
        fechaFinTrial.setDate(fechaFinTrial.getDate() + Number(diasTrial));

        // Premium configuration by default
        const configuracionPremium = {
            colorPrincipal: '#cc2b2b',
            colorAccent: '#1e3a8a',
            heroTitle: 'REDEFINIENDO EL ESTILO MASCULINO',
            mensajeBienvenida: 'Más que un corte, una experiencia. Descubre la excelencia en cada detalle.',
            badge: 'TRADICIÓN Y EXCELENCIA',
            ctaPrimary: 'Reservar Turno',
            ctaSecondary: 'Ver Servicios',
            logoUrl: '',
            bannerUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80',
            galeria: [
                'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80',
                'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80',
                'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1200&q=80'
            ],
            instagram: '',
            facebook: '',
            googleMapsUrl: '',
            seoTitle: `${nombre} - Barbería Profesional`,
            seoDescription: `Descubre ${nombre}, tu barbería de confianza. Servicios profesionales de corte, barba y estilo masculino.`,
            template: 'modern',
            notificaciones: {
                emailEnabled: true,
                pushEnabled: true,
                whatsappEnabled: false,
                reminderHoursBefore: 24,
                confirmacionReserva: true,
                recordatorioReserva: true,
                cancelacionReserva: true
            }
        };

        // Execute in transaction
        return await TransactionManager.executeInTransaction(
            async (session) => {
                // Create barberia entity
                const barberia = new Barberia({
                    nombre,
                    slug: slugNormalizado,
                    email: emailBarberia,
                    telefono,
                    rut,
                    direccion,
                    plan,
                    estado: 'trial',
                    fechaFinTrial,
                    proximoPago: fechaFinTrial,
                    configuracion: configuracionPremium,
                    historial: []
                });

                // Add creation history entry
                barberia.addHistoryEntry(
                    'creada',
                    currentUserId,
                    `Barbería creada con ${diasTrial} días de trial y tema premium Barber Pole`
                );

                // Save barberia
                const savedBarberia = await this.barberiaRepository.save(barberia, session);

                // Hash admin password
                const salt = await bcrypt.genSalt(10);
                const passwordHash = await bcrypt.hash(adminPassword, salt);

                // Create admin user
                const admin = await this.userRepository.create({
                    nombre: adminNombre,
                    email: adminEmailNorm,
                    password: passwordHash,
                    telefono: adminTelefono,
                    rol: 'BARBERIA_ADMIN',
                    barberiaId: savedBarberia.id,
                    barberiaIds: [savedBarberia.id],
                    activo: true
                }, session);

                // Send welcome email (async, don't block)
                this.emailService.sendWelcomeEmail(adminEmailNorm, adminNombre, slugNormalizado)
                    .catch(err => console.error('Error sending welcome email:', err));

                return {
                    barberia: savedBarberia,
                    admin
                };
            },
            { operationName: 'CreateBarberia' }
        );
    }
}

module.exports = CreateBarberia;
