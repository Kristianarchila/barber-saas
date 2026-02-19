/**
 * Barberia Controller (Hexagonal Architecture Version)
 * Acts as an adapter in the interfaces layer
 */
const container = require('../shared/Container');
const nodemailer = require('nodemailer');

// ==========================================
// 1) CREAR BARBERÍA (SUPER_ADMIN)
// ==========================================
exports.createBarberia = async (req, res, next) => {
    try {
        const useCase = container.createBarberiaUseCase;
        const barberia = await useCase.execute(req.body);

        res.status(201).json({
            message: 'Barbería creada',
            barberia: barberia.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2) LISTAR BARBERÍAS (SUPER_ADMIN)
// ==========================================
exports.getBarberias = async (req, res, next) => {
    try {
        const useCase = container.listBarberiasUseCase;
        const barberias = await useCase.execute();

        res.json({
            total: barberias.length,
            barberias: barberias.map(b => b.toObject())
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3) OBTENER BARBERÍA POR ID
// ==========================================
exports.getBarberiaById = async (req, res, next) => {
    try {
        const useCase = container.getBarberiaByIdUseCase;
        const barberia = await useCase.execute(req.params.id);

        res.json({ barberia: barberia.toObject() });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4) OBTENER MI BARBERÍA (BARBERIA_ADMIN)
// ==========================================
exports.getMiBarberia = async (req, res, next) => {
    try {
        const barberiaId = req.user?.barberiaId;
        if (!barberiaId) return res.status(403).json({ message: 'No autorizado' });

        const useCase = container.getMiBarberiaUseCase;
        const barberia = await useCase.execute(barberiaId);

        res.json({ barberia: barberia.toObject() });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5) ACTUALIZAR CONFIGURACIÓN (GENERAL / EMAIL)
// ==========================================
exports.actualizarConfiguracionGeneral = async (req, res, next) => {
    try {
        const barberiaId = req.user?.barberiaId;
        if (!barberiaId) return res.status(403).json({ message: 'No autorizado' });

        const useCase = container.updateBarberiaConfigUseCase;

        // 📝 Pasar userId y request para auditoría
        const barberia = await useCase.execute(
            barberiaId,
            req.body,
            req.user._id,  // userId para auditoría
            req            // request para auditoría
        );

        res.json({
            message: 'Configuración actualizada correctamente',
            barberia: barberia.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// Alias for email config
exports.actualizarConfiguracionEmail = exports.actualizarConfiguracionGeneral;

// ==========================================
// 6) OBTENER CONFIGURACIÓN DE EMAIL
// ==========================================
exports.getConfiguracionEmail = async (req, res, next) => {
    try {
        const barberiaId = req.user?.barberiaId;
        const useCase = container.getMiBarberiaUseCase;
        const barberia = await useCase.execute(barberiaId);

        res.json({
            config: {
                emailNotificaciones: barberia.configuracion?.emailNotificaciones || "",
                nombreParaEmails: barberia.configuracion?.nombreParaEmails || "",
                isConfigured: Boolean(barberia.configuracion?.emailNotificaciones)
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 7) PROBAR CONFIGURACIÓN DE EMAIL
// ==========================================
exports.testConfiguracionEmail = async (req, res, next) => {
    try {
        const { emailNotificaciones, emailPassword, emailProvider, smtpConfig } = req.body;

        let config = {
            service: emailProvider || 'gmail',
            auth: {
                user: emailNotificaciones,
                pass: emailPassword
            }
        };

        if (emailProvider === 'smtp' && smtpConfig?.host) {
            config = {
                host: smtpConfig.host,
                port: smtpConfig.port || 587,
                secure: smtpConfig.secure || false,
                auth: {
                    user: emailNotificaciones,
                    pass: emailPassword
                }
            };
        }

        const transporter = nodemailer.createTransport(config);
        await transporter.verify();

        await transporter.sendMail({
            from: `"Test" <${emailNotificaciones}>`,
            to: emailNotificaciones,
            subject: '✅ Configuración de Email Exitosa - Barber SaaS',
            html: '<h2>¡Configuración exitosa!</h2><p>Tu servidor de email está correctamente configurado.</p>'
        });

        res.json({
            success: true,
            message: 'Configuración válida. Email de prueba enviado a ' + emailNotificaciones
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al validar configuración',
            error: error.message
        });
    }
};
