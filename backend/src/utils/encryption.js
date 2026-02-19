const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.EMAIL_ENCRYPTION_KEY, 'hex'); // 32 bytes (64 hex chars)

/**
 * Encripta una contraseña de email usando AES-256-GCM
 * @param {string} text - Texto plano a encriptar
 * @returns {Object} - Objeto con encrypted, iv, authTag
 */
exports.encrypt = (text) => {
    if (!text) {
        throw new Error('No se puede encriptar un texto vacío');
    }

    if (!process.env.EMAIL_ENCRYPTION_KEY) {
        throw new Error('EMAIL_ENCRYPTION_KEY no está configurada en .env');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
    };
};

/**
 * Desencripta una contraseña de email
 * @param {string} encrypted - Texto encriptado
 * @param {string} iv - Vector de inicialización
 * @param {string} authTag - Tag de autenticación
 * @returns {string} - Texto plano desencriptado
 */
exports.decrypt = (encrypted, iv, authTag) => {
    if (!encrypted || !iv || !authTag) {
        throw new Error('Faltan parámetros para desencriptar');
    }

    if (!process.env.EMAIL_ENCRYPTION_KEY) {
        throw new Error('EMAIL_ENCRYPTION_KEY no está configurada en .env');
    }

    try {
        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            KEY,
            Buffer.from(iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(authTag, 'hex'));

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('❌ Error desencriptando:', error.message);
        throw new Error('No se pudo desencriptar la contraseña');
    }
};

/**
 * Verifica si una contraseña está encriptada (tiene la estructura correcta)
 * @param {*} passwordObj - Objeto a verificar
 * @returns {boolean}
 */
exports.isEncrypted = (passwordObj) => {
    return (
        passwordObj &&
        typeof passwordObj === 'object' &&
        passwordObj.encrypted &&
        passwordObj.iv &&
        passwordObj.authTag
    );
};
