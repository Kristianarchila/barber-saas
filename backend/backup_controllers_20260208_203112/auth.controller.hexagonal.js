/**
 * Auth Controller (Hexagonal Architecture Version)
 * Acts as an adapter in the interfaces layer
 */
const container = require('../shared/Container');
const generateToken = require('../utils/generateToken');

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
