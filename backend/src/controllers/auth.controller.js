/**
 * Auth Controller (Hexagonal Architecture Version)
 * Acts as an adapter in the interfaces layer
 */
const container = require('../shared/Container');
const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const tokenBlacklist = require('../infrastructure/cache/TokenBlacklist');

// ==========================================
// 1) REGISTER
// ==========================================
exports.register = async (req, res, next) => {
    try {
        const useCase = container.registerUseCase;
        const user = await useCase.execute(req.body);

        res.status(201).json({
            message: 'Usuario creado',
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        });
    } catch (error) {
        if (error.message === 'Email ya registrado') {
            return res.status(409).json({ message: error.message });
        }
        next(error);
    }
};

// ==========================================
// 2) LOGIN
// ==========================================
exports.login = async (req, res, next) => {
    try {
        const useCase = container.loginUseCase;

        // We requested populateBarberia: true to get the slug
        const user = await useCase.execute(req.body.email, req.body.password, {
            populateBarberia: true
        });

        // Generate token
        const token = generateToken(user);

        // Response
        res.json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
                barberiaId: user.barberiaId,
                barberiaSlug: user.barberia?.slug // From populated data
            }
        });
    } catch (error) {
        if (error.message === 'Credenciales inválidas') {
            return res.status(401).json({ message: error.message });
        }
        next(error);
    }
};

// ==========================================
// 3) LOGOUT
// ==========================================
exports.logout = async (req, res) => {
    try {
        // Extract token from header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];

            // Decode to get expiration time
            const decoded = jwt.decode(token);
            if (decoded && decoded.exp) {
                const expiresInMs = (decoded.exp * 1000) - Date.now();

                // Only blacklist if not already expired
                if (expiresInMs > 0) {
                    await tokenBlacklist.add(token, expiresInMs, {
                        userId: req.user?._id,
                        reason: 'logout'
                    });
                }
            }
        }

        res.json({ message: 'Logout exitoso' });
    } catch (error) {
        // Even if there's an error, return success (logout is idempotent)
        res.json({ message: 'Logout exitoso' });
    }
};
