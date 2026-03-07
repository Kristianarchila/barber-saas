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

        // 4. Build reset URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost';
        const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

        // 5. Send email — wrapped: if SMTP isn't configured we still return 200
        try {
            await emailService.sendPasswordReset(user.email, resetUrl);
        } catch (emailError) {
            // Dev-only warning — never expose to client
            console.warn('[RequestPasswordReset] Email no enviado (revisa EMAIL_USER / EMAIL_PASS en .env):', emailError.message);
            // In dev: log the reset link so the superadmin can use it directly
            if (process.env.NODE_ENV !== 'production') {
                console.info(`[DEV] Reset link para ${user.email}: ${resetUrl}`);
            }
        }
    }
}

module.exports = new RequestPasswordResetUseCase();
