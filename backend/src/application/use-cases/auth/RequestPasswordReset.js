/**
 * RequestPasswordReset Use Case
 * Generates a reset token, saves it on the user, and sends an email.
 */
const crypto = require('crypto');
const UserModel = require('../../../infrastructure/database/mongodb/models/User');
const emailService = require('../../../infrastructure/email/EmailService');

class RequestPasswordResetUseCase {
    async execute(email) {
        // 1. Find user (case-insensitive)
        const user = await UserModel.findOne({ email: email.toLowerCase().trim() });

        // Always respond "ok" to avoid email enumeration
        if (!user) return;

        // 2. Generate secure token (64 hex chars)
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // 3. Save token hash on user (store hash, not plain token)
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        user.passwordResetToken = tokenHash;
        user.passwordResetExpires = expires;
        await user.save({ validateBeforeSave: false });

        // 4. Get Barberia config for branding
        const Barberia = require('../../../infrastructure/database/mongodb/models/Barberia');
        let barberiaConfig = null;
        if (user.barberiaId) {
            const barberia = await Barberia.findById(user.barberiaId);
            if (barberia) {
                barberiaConfig = {
                    nombre: barberia.nombre,
                    design: barberia.configuracion?.emailDesign || 'modern',
                    bannerUrl: barberia.configuracion?.emailBannerUrl || barberia.configuracion?.logoUrl,
                    primaryColor: barberia.configuracion?.colorPrincipal || '#3b82f6'
                };
            }
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost';
        const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

        // 5. Send email
        // We no longer catch the error here to allow it to bubble up to the controller.
        // This ensures that if SMTP is blocked (e.g. by Hetzner), the user/admin gets a real error.
        await emailService.sendPasswordReset(user.email, resetUrl, barberiaConfig);
    }
}

module.exports = new RequestPasswordResetUseCase();
