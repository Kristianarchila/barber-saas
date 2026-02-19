const bcrypt = require('bcrypt');
const IPasswordService = require('../../domain/services/IPasswordService');

/**
 * Bcrypt Implementation of IPasswordService
 */
class BcryptPasswordService extends IPasswordService {
    async hash(password) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    async compare(password, hashedPassword) {
        if (!password || !hashedPassword) return false;
        return await bcrypt.compare(password, hashedPassword);
    }
}

module.exports = BcryptPasswordService;
