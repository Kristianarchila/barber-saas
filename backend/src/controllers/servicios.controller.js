/**
 * Servicios Controller (Hexagonal Architecture Version)
 */

const container = require('../shared/Container');

// =========================================================
// 1) CREATE SERVICIO
// =========================================================
exports.crearServicio = async (req, res, next) => {
    try {
        const useCase = container.createServicioUseCase;

        const servicio = await useCase.execute({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            duracion: req.body.duracion,
            precio: req.body.precio,
            imagen: req.body.imagen,
            barberiaId: req.user.barberiaId
        });

        res.status(201).json({
            message: 'Servicio creado exitosamente',
            servicio: servicio.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 2) UPDATE SERVICIO
// =========================================================
exports.editarServicio = async (req, res, next) => {
    try {
        const useCase = container.updateServicioUseCase;

        const servicio = await useCase.execute(
            req.params.id,
            {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                duracion: req.body.duracion,
                precio: req.body.precio,
                imagen: req.body.imagen
            },
            req.user.barberiaId
        );

        res.json({
            message: 'Servicio actualizado exitosamente',
            servicio: servicio.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 3) TOGGLE SERVICIO STATUS
// =========================================================
exports.cambiarEstadoServicio = async (req, res, next) => {
    try {
        const servicioRepository = container.servicioRepository;
        const servicio = await servicioRepository.findById(req.params.id, req.user.barberiaId);

        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        if (servicio.barberiaId !== req.user.barberiaId) {
            return res.status(403).json({ message: 'No tienes permisos' });
        }

        if (req.body.activo) {
            servicio.activate();
        } else {
            servicio.deactivate();
        }

        await servicioRepository.update(servicio.id, servicio.toObject());

        res.json({
            message: 'Estado actualizado',
            servicio: servicio.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 4) DELETE SERVICIO
// =========================================================
exports.eliminarServicio = async (req, res, next) => {
    try {
        const useCase = container.deleteServicioUseCase;

        await useCase.execute(
            req.params.id,
            req.user.barberiaId,
            false // Don't force delete
        );

        res.json({ message: 'Servicio eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 5) LIST SERVICIOS
// =========================================================
exports.obtenerServicios = async (req, res, next) => {
    try {
        const useCase = container.listServiciosUseCase;
        const onlyActive = req.query.activo === 'true';

        // Fix: Use req.barberiaId (from slug) if req.user.barberiaId is null (for SUPER_ADMIN)
        const barberiaId = req.user.barberiaId || req.barberiaId;

        if (!barberiaId) {
            return res.status(400).json({ message: 'Barberia ID es requerido' });
        }

        const servicios = await useCase.execute(barberiaId, onlyActive);

        res.json({
            total: servicios.length,
            servicios: servicios.map(s => s.toObject())
        });
    } catch (error) {
        next(error);
    }
};
