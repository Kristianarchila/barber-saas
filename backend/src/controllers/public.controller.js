/**
 * Public Controller (Hexagonal Architecture Version)
 * Acts as an adapter for public-facing endpoints
 */
const container = require('../shared/Container');

// ==========================================
// 1) GET BARBERIA BY SLUG
// ==========================================
exports.getBarberiaBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const useCase = container.getBarberiaBySlugUseCase;
        const barberia = await useCase.execute(slug);

        res.json({
            _id: barberia.id,
            nombre: barberia.nombre,
            slug: barberia.slug,
            direccion: barberia.direccion,
            telefono: barberia.telefono,
            email: barberia.email,
            configuracion: barberia.configuracion
        });
    } catch (error) {
        if (error.message.includes('no encontrada') || error.message.includes('no está disponible')) {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};

// ==========================================
// 2) GET BARBEROS BY SLUG
// ==========================================
exports.getBarberosBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        // Get barberia first
        const barberiaUseCase = container.getBarberiaBySlugUseCase;
        const barberia = await barberiaUseCase.execute(slug);

        // Get barberos
        const useCase = container.listBarberosUseCase;
        const barberos = await useCase.execute(barberia.id, { activo: true });

        res.json(barberos.map(b => ({
            _id: b.id,
            nombre: b.nombre,
            foto: b.foto,
            descripcion: b.descripcion,
            especialidades: b.especialidades,
            experiencia: b.experiencia
        })));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3) GET SERVICIOS BY SLUG
// ==========================================
exports.getServiciosBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        // Get barberia first
        const barberiaUseCase = container.getBarberiaBySlugUseCase;
        const barberia = await barberiaUseCase.execute(slug);

        // Get servicios
        const useCase = container.listServiciosUseCase;
        const servicios = await useCase.execute(barberia.id);

        res.json(servicios.map(s => s.toObject()));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4) GET DISPONIBILIDAD BY SLUG
// ==========================================
exports.getDisponibilidadBySlug = async (req, res, next) => {
    try {
        const { slug, barberoId } = req.params;
        const { fecha, servicioId } = req.query;

        if (!fecha || !servicioId) {
            return res.status(400).json({
                message: "Debe enviar fecha y servicioId"
            });
        }

        // Get barberia first
        const barberiaUseCase = container.getBarberiaBySlugUseCase;
        const barberia = await barberiaUseCase.execute(slug);

        // Get available slots
        const useCase = container.getAvailableSlotsUseCase;
        const slots = await useCase.execute({
            barberiaId: barberia.id,
            barberoId,
            servicioId,
            fecha
        });

        res.json({
            barberoId,
            fecha,
            servicioId,
            turnosDisponibles: slots
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5) CREAR RESERVA BY SLUG
// ==========================================
exports.crearReservaBySlug = async (req, res, next) => {
    try {
        const { slug, barberoId } = req.params;
        const { fecha, hora, emailCliente, nombreCliente, servicioId } = req.body;

        if (!fecha || !hora || !emailCliente || !nombreCliente || !servicioId) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            });
        }

        // Get barberia first
        const barberiaUseCase = container.getBarberiaBySlugUseCase;
        const barberia = await barberiaUseCase.execute(slug);

        // Create reservation
        const useCase = container.createReservaUseCase;
        const reserva = await useCase.execute({
            barberiaId: barberia.id,
            barberoId,
            servicioId,
            fecha,
            hora,
            nombreCliente,
            emailCliente,
            isPublic: true
        });

        res.status(201).json({
            message: "Reserva creada correctamente",
            reserva: reserva.toObject()
        });
    } catch (error) {
        // Let error handler middleware handle all errors with proper status codes
        // ReservationConflictError will return 409, ValidationError will return 400, etc.
        next(error);
    }
};
