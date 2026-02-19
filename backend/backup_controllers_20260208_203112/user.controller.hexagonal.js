/**
 * User Controller (Hexagonal Architecture Version)
 * Acts as an adapter in the interfaces layer
 */
const container = require('../shared/Container');

// ==========================================
// 1) CREAR BARBERIA_ADMIN (SUPER_ADMIN)
// ==========================================
exports.createBarberiaAdmin = async (req, res, next) => {
    try {
        const useCase = container.createBarberiaAdminUseCase;
        const user = await useCase.execute(req.body);

        res.status(201).json({
            message: 'Administrador de barbería creado',
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
                barberiaId: user.barberiaId
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2) CREAR USUARIO BARBERO (BARBERIA_ADMIN)
// ==========================================
exports.createUsuarioBarbero = async (req, res, next) => {
    try {
        if (req.user.rol !== 'BARBERIA_ADMIN') {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const useCase = container.createUsuarioBarberoUseCase;
        const user = await useCase.execute(req.body);

        res.status(201).json({
            message: 'Usuario barbero creado',
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3) MIS BARBERÍAS (MULTI-SEDE)
// ==========================================
exports.getMyBarberias = async (req, res, next) => {
    try {
        const useCase = container.getMyBarberiasUseCase;
        const barberias = await useCase.execute(req.user.id);

        res.json(barberias.map(b => ({
            id: b.id,
            nombre: b.nombre,
            slug: b.slug,
            logoUrl: b.configuracion?.logoUrl,
            direccion: b.direccion
        })));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4) LISTAR CLIENTES
// ==========================================
exports.obtenerClientesByBarberia = async (req, res, next) => {
    try {
        const useCase = container.listClientesUseCase;
        const clientes = await useCase.execute(req.user.barberiaId);

        res.json(clientes.map(c => ({
            id: c.id,
            nombre: c.nombre,
            email: c.email,
            createdAt: c.createdAt
        })));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5) CREAR CLIENTE (ADMIN)
// ==========================================
exports.createCliente = async (req, res, next) => {
    try {
        const useCase = container.createClienteUseCase;
        const user = await useCase.execute({
            ...req.body,
            barberiaId: req.user.barberiaId
        });

        res.status(201).json({
            message: 'Cliente creado exitosamente',
            cliente: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};
