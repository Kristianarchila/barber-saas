/**
 * ResetPassword Use Case
 * Validates the token and sets the new password.
 */
const crypto = require('crypto');
const UserModel = require('../../../infrastructure/database/mongodb/models/User');

class ResetPasswordUseCase {
    async execute(token, newPassword) {
        // 1. Hash the incoming token
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // 2. Find user with valid (not expired) token
        const user = await UserModel.findOne({
            passwordResetToken: tokenHash,
            passwordResetExpires: { $gt: Date.now() }
        }).select('+password');

        if (!user) {
            throw new Error('Token inválido o expirado');
        }

        // 3. Set new password (pre-save hook will hash it)
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
    }
}

module.exports = new ResetPasswordUseCase();
