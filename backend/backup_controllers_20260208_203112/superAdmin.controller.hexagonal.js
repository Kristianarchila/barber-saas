/**
 * SuperAdmin Controller (Hexagonal Architecture Version)
 * Acts as an adapter for super admin operations
 */
const container = require('../shared/Container');

// ==========================================
// 1) ESTADÍSTICAS GENERALES
// ==========================================
exports.obtenerEstadisticas = async (req, res, next) => {
    try {
        // Para estadísticas, necesitamos acceder directamente al modelo de Mongoose
        // porque las entidades de dominio no incluyen campos como 'estado', 'proximoPago', etc.
        const BarberiaModel = require('../models/Barberia');

        const barberias = await BarberiaModel.find().lean();

        const totalBarberias = barberias.length;
        const activas = barberias.filter(b => b.estado === 'activa').length;
        const trial = barberias.filter(b => b.estado === 'trial').length;
        const suspendidas = barberias.filter(b => b.estado === 'suspendida').length;

        // Próximas a vencer
        const hoy = new Date();
        const en5Dias = new Date();
        en5Dias.setDate(en5Dias.getDate() + 5);

        const proximasVencer = barberias
            .filter(b =>
                ['activa', 'trial'].includes(b.estado) &&
                b.proximoPago &&
                new Date(b.proximoPago) <= en5Dias &&
                new Date(b.proximoPago) >= hoy
            )
            .map(b => ({
                id: b._id.toString(),
                nombre: b.nombre,
                email: b.email,
                estado: b.estado,
                proximoPago: b.proximoPago,
                diasRestantes: Math.ceil((new Date(b.proximoPago) - hoy) / (1000 * 60 * 60 * 24))
            }))
            .sort((a, b) => new Date(a.proximoPago) - new Date(b.proximoPago));

        // Nuevas este mes
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const nuevasEsteMes = barberias.filter(b =>
            b.createdAt && new Date(b.createdAt) >= inicioMes
        ).length;

        res.json({
            totalBarberias,
            activas,
            trial,
            suspendidas,
            nuevasEsteMes,
            proximasVencer
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2) LISTAR BARBERÍAS
// ==========================================
exports.obtenerBarberias = async (req, res, next) => {
    try {
        // Para SuperAdmin, necesitamos todos los campos incluyendo estado, proximoPago, etc.
        const BarberiaModel = require('../models/Barberia');

        const barberias = await BarberiaModel.find().sort({ createdAt: -1 }).lean();

        res.json({
            barberias: barberias.map(b => ({
                ...b,
                id: b._id.toString(),
                _id: b._id.toString()
            })),
            pagination: {
                total: barberias.length,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                pages: Math.ceil(barberias.length / (parseInt(req.query.limit) || 10))
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3) OBTENER BARBERÍA ESPECÍFICA
// ==========================================
exports.obtenerBarberia = async (req, res, next) => {
    try {
        const { id } = req.params;
        const useCase = container.getBarberiaByIdUseCase;
        const barberia = await useCase.execute(id);

        res.json(barberia.toObject());
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4) CREAR BARBERÍA
// ==========================================
exports.crearBarberia = async (req, res, next) => {
    try {
        const useCase = container.createBarberiaUseCase;
        const barberia = await useCase.execute(req.body, req.user._id.toString());

        res.status(201).json({
            message: "Barbería creada exitosamente",
            barberia: barberia.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5) ACTUALIZAR BARBERÍA
// ==========================================
exports.actualizarBarberia = async (req, res, next) => {
    try {
        const { id } = req.params;
        const useCase = container.updateBarberiaConfigUseCase;
        const barberia = await useCase.execute(id, req.body, req.user._id.toString());

        res.json({
            message: "Barbería actualizada exitosamente",
            barberia: barberia.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 6) CAMBIAR ESTADO
// ==========================================
exports.cambiarEstado = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { estado, notas } = req.body;

        if (!['trial', 'activa', 'suspendida'].includes(estado)) {
            return res.status(400).json({
                message: "Estado inválido. Debe ser: trial, activa o suspendida"
            });
        }

        const useCase = container.updateBarberiaConfigUseCase;
        const barberia = await useCase.execute(id, { estado, notas }, req.user._id.toString());

        res.json({
            message: estado === 'activa' ? "Barbería activada exitosamente" :
                estado === 'suspendida' ? "Barbería suspendida exitosamente" :
                    "Barbería en trial",
            barberia: {
                id: barberia.id,
                nombre: barberia.nombre,
                estado: barberia.estado,
                proximoPago: barberia.proximoPago
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 7) EXTENDER PLAZO
// ==========================================
exports.extenderPlazo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { dias = 30, notas } = req.body;

        const useCase = container.getBarberiaByIdUseCase;
        const barberia = await useCase.execute(id);

        const base = barberia.proximoPago ? new Date(barberia.proximoPago) : new Date();
        const nuevaFecha = new Date(base);
        nuevaFecha.setDate(nuevaFecha.getDate() + Number(dias));

        const updateUseCase = container.updateBarberiaConfigUseCase;
        const updated = await updateUseCase.execute(id, {
            proximoPago: nuevaFecha,
            notas: notas || `Plazo extendido ${dias} días hasta ${nuevaFecha.toISOString().split("T")[0]}`
        }, req.user._id.toString());

        res.json({
            message: `Plazo extendido ${dias} días`,
            barberia: {
                id: updated.id,
                nombre: updated.nombre,
                proximoPago: updated.proximoPago
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 8) ELIMINAR BARBERÍA (SOFT DELETE)
// ==========================================
exports.eliminarBarberia = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { confirmar } = req.body;

        if (!confirmar) {
            return res.status(400).json({
                message: "Debes confirmar la eliminación enviando { confirmar: true }"
            });
        }

        const useCase = container.updateBarberiaConfigUseCase;
        const barberia = await useCase.execute(id, {
            estado: 'suspendida',
            activa: false,
            notas: "Barbería suspendida desde panel SUPER_ADMIN"
        }, req.user._id.toString());

        res.json({
            message: "Barbería suspendida exitosamente",
            barberia: {
                id: barberia.id,
                nombre: barberia.nombre,
                estado: barberia.estado
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 9) OBTENER HISTORIAL
// ==========================================
exports.obtenerHistorial = async (req, res, next) => {
    try {
        const { id } = req.params;
        const useCase = container.getBarberiaByIdUseCase;
        const barberia = await useCase.execute(id);

        res.json({
            nombre: barberia.nombre,
            historial: barberia.historial || []
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 10) FINANZAS GLOBALES
// ==========================================
exports.getFinanzasGlobales = async (req, res, next) => {
    try {
        // This would need a specific use case for global stats
        // For now, return a placeholder
        res.json({
            ingresosTotales: 0,
            totalReservas: 0,
            message: "Implementación pendiente en hexagonal architecture"
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 11) GESTIÓN DE ADMINISTRADORES
// ==========================================
exports.obtenerAdmins = async (req, res, next) => {
    try {
        const useCase = container.getAdminsUseCase;
        const admins = await useCase.execute();
        res.json(admins);
    } catch (error) {
        next(error);
    }
};

exports.actualizarSedesAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { barberiaIds } = req.body;

        if (!Array.isArray(barberiaIds)) {
            return res.status(400).json({ message: "barberiaIds debe ser un array" });
        }

        const useCase = container.updateAdminSedesUseCase;
        const result = await useCase.execute(id, barberiaIds);

        res.json(result);
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 12) GESTIÓN DE SUCURSALES
// ==========================================
exports.obtenerSucursales = async (req, res, next) => {
    try {
        const { id } = req.params;
        const useCase = container.getBarberiaByIdUseCase;
        const barberia = await useCase.execute(id);

        res.json({
            esMatriz: barberia.esMatriz || false,
            sucursales: barberia.sucursales || []
        });
    } catch (error) {
        next(error);
    }
};

exports.crearSucursal = async (req, res, next) => {
    try {
        const { id } = req.params;
        // This would need a specific use case
        res.status(501).json({ message: "Implementación pendiente" });
    } catch (error) {
        next(error);
    }
};

exports.actualizarSucursal = async (req, res, next) => {
    try {
        res.status(501).json({ message: "Implementación pendiente" });
    } catch (error) {
        next(error);
    }
};

exports.eliminarSucursal = async (req, res, next) => {
    try {
        res.status(501).json({ message: "Implementación pendiente" });
    } catch (error) {
        next(error);
    }
};

exports.toggleMatriz = async (req, res, next) => {
    try {
        res.status(501).json({ message: "Implementación pendiente" });
    } catch (error) {
        next(error);
    }
};
