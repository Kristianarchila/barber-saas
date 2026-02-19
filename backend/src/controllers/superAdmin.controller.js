/**
 * SuperAdmin Controller (Hexagonal Architecture Version)
 * Acts as an adapter in the interfaces layer
 */
const container = require('../shared/Container');

// =========================================================
// ESTADÍSTICAS GENERALES
// =========================================================
exports.obtenerEstadisticas = async (req, res, next) => {
  try {
    const useCase = container.getGlobalStatsUseCase;
    const stats = await useCase.execute();
    res.json(stats);
  } catch (error) {
    console.error('❌ [SUPERADMIN] Error al obtener estadísticas:', error);
    next(error);
  }
};

// =========================================================
// LISTAR TODAS LAS BARBERÍAS
// =========================================================
exports.obtenerBarberias = async (req, res, next) => {
  try {
    const { estado, busqueda, page = 1, limit = 10 } = req.query;

    const filters = {};
    if (estado) filters.estado = estado;
    if (busqueda) filters.busqueda = busqueda;

    const pagination = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    };

    const useCase = container.listBarberiasAdminUseCase;
    const result = await useCase.execute(filters, pagination);

    res.json(result);
  } catch (error) {
    console.error('❌ [SUPERADMIN] Error al obtener barberías:', error);
    next(error);
  }
};

// =========================================================
// OBTENER UNA BARBERÍA ESPECÍFICA
// =========================================================
exports.obtenerBarberia = async (req, res, next) => {
  try {
    const { id } = req.params;

    const useCase = container.getBarberiaDetailsAdminUseCase;
    const result = await useCase.execute(id);

    res.json(result);
  } catch (error) {
    console.error('❌ [SUPERADMIN] Error al obtener barbería:', error);
    next(error);
  }
};

// =========================================================
// CREAR NUEVA BARBERÍA CON ADMIN
// =========================================================
exports.crearBarberia = async (req, res, next) => {
  try {
    const useCase = container.createBarberiaAdminUseCase;
    const result = await useCase.execute(req.body, req.user._id);

    res.status(201).json({
      message: 'Barbería creada exitosamente',
      barberia: {
        id: result.barberia.id,
        nombre: result.barberia.nombre,
        slug: result.barberia.slug,
        estado: result.barberia.estado,
        fechaFinTrial: result.barberia.fechaFinTrial
      },
      admin: {
        nombre: result.admin.nombre,
        email: result.admin.email
      }
    });
  } catch (error) {
    console.error('❌ [SUPERADMIN] Error al crear barbería:', error);
    next(error);
  }
};

// =========================================================
// ACTUALIZAR DATOS DE BARBERÍA
// =========================================================
exports.actualizarBarberia = async (req, res, next) => {
  try {
    const { id } = req.params;

    const useCase = container.updateBarberiaAdminUseCase;
    const barberia = await useCase.execute(id, req.body, req.user._id);

    res.json({
      message: 'Barbería actualizada exitosamente',
      barberia: barberia.toObject()
    });
  } catch (error) {
    console.error('❌ [SUPERADMIN] Error al actualizar barbería:', error);
    next(error);
  }
};

// =========================================================
// CAMBIAR ESTADO
// =========================================================
exports.cambiarEstado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado, notas } = req.body;

    const useCase = container.changeBarberiaStatusAdminUseCase;
    const barberia = await useCase.execute(id, estado, req.user._id, notas);

    const barberiaObj = barberia.toObject();

    res.json({
      message: estado === 'activa'
        ? 'Barbería activada exitosamente'
        : estado === 'suspendida'
          ? 'Barbería suspendida exitosamente'
          : 'Barbería en trial',
      barberia: {
        id: barberiaObj.id,
        nombre: barberiaObj.nombre,
        estado: barberiaObj.estado,
        proximoPago: barberiaObj.proximoPago
      }
    });
  } catch (error) {
    console.error('❌ [SUPERADMIN] Error al cambiar estado:', error);
    next(error);
  }
};

// =========================================================
// EXTENDER PLAZO DE PAGO
// =========================================================
exports.extenderPlazo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dias = 30, notas } = req.body;

    const useCase = container.extendPaymentDeadlineAdminUseCase;
    const result = await useCase.execute(id, dias, req.user._id, notas);

    const barberiaObj = result.barberia.toObject();

    res.json({
      message: `Plazo extendido ${result.diasExtendidos} días`,
      barberia: {
        id: barberiaObj.id,
        nombre: barberiaObj.nombre,
        proximoPago: barberiaObj.proximoPago
      }
    });
  } catch (error) {
    console.error('❌ [SUPERADMIN] Error al extender plazo:', error);
    next(error);
  }
};

// =========================================================
// ELIMINAR BARBERÍA (SOFT: SUSPENDER + DESACTIVAR USUARIOS)
// =========================================================
exports.eliminarBarberia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { confirmar } = req.body;

    const useCase = container.deleteBarberiaAdminUseCase;
    const result = await useCase.execute(id, req.user._id, confirmar);

    res.json(result);
  } catch (error) {
    console.error('❌ [SUPERADMIN] Error al eliminar barbería:', error);
    next(error);
  }
};

// =========================================================
// HISTORIAL
// =========================================================
exports.obtenerHistorial = async (req, res, next) => {
  try {
    const { id } = req.params;

    const useCase = container.getBarberiaDetailsAdminUseCase;
    const result = await useCase.execute(id);

    res.json({
      nombre: result.nombre,
      historial: result.historial ? result.historial.sort((a, b) => b.fecha - a.fecha) : []
    });
  } catch (error) {
    console.error('❌ [SUPERADMIN] Error al obtener historial:', error);
    next(error);
  }
};

// =========================================================
// FINANZAS GLOBALES
// =========================================================
exports.getFinanzasGlobales = async (req, res, next) => {
  try {
    // This endpoint uses direct model access for now
    // TODO: Create GetFinanzasGlobales use case
    const Reserva = require('../infrastructure/database/mongodb/models/Reserva');

    const reservas = await Reserva.find({
      estado: 'COMPLETADA'
    }).populate('servicioId', 'precio');

    let ingresosTotales = 0;
    let totalReservas = reservas.length;

    reservas.forEach(r => {
      ingresosTotales += r.servicioId?.precio || 0;
    });

    res.json({
      ingresosTotales,
      totalReservas
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GESTIÓN DE ADMINISTRADORES (Multi-sede)
// =========================================================
exports.obtenerAdmins = async (req, res, next) => {
  try {
    const useCase = container.getAdminsUseCase;
    const admins = await useCase.execute(req.query);
    res.json(admins);
  } catch (error) {
    next(error);
  }
};

exports.actualizarSedesAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { barberiaIds } = req.body;

    const useCase = container.updateAdminSedesUseCase;
    const user = await useCase.execute(id, barberiaIds);

    res.json({ message: 'Sedes actualizadas correctamente', user });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GESTIÓN DE SUCURSALES (Multi-Location)
// =========================================================

// Obtener todas las sucursales de una barbería
exports.obtenerSucursales = async (req, res, next) => {
  try {
    const { id } = req.params;

    // This endpoint uses direct model access for now
    // TODO: Create GetSucursales use case
    const Barberia = require('../infrastructure/database/mongodb/models/Barberia');
    const barberia = await Barberia.findById(id).select('nombre esMatriz sucursales');

    if (!barberia) return res.status(404).json({ message: 'Barbería no encontrada' });

    res.json({
      esMatriz: barberia.esMatriz,
      sucursales: barberia.sucursales || []
    });
  } catch (error) {
    console.error('❌ [SUPERADMIN] Error al obtener sucursales:', error);
    next(error);
  }
};

// Crear nueva sucursal
exports.crearSucursal = async (req, res, next) => {
  try {
    // This endpoint uses direct model access for now
    // TODO: Create CreateSucursal use case
    const { id } = req.params;
    const sucursalData = req.body;

    const Barberia = require('../infrastructure/database/mongodb/models/Barberia');
    const Slug = require('../domain/value-objects/Slug');

    const barberia = await Barberia.findById(id);
    if (!barberia) return res.status(404).json({ message: 'Barbería no encontrada' });

    // Validate required fields
    if (!sucursalData.nombre || !sucursalData.slug) {
      return res.status(400).json({ message: 'Nombre y slug son requeridos' });
    }

    // Normalize slug
    const slugNormalizado = Slug.normalize(sucursalData.slug);
    if (!slugNormalizado) {
      return res.status(400).json({ message: 'Slug inválido' });
    }

    // Verify slug uniqueness within sucursales
    const slugExiste = barberia.sucursales.some(s => s.slug === slugNormalizado);
    if (slugExiste) {
      return res.status(400).json({ message: 'El slug ya existe en otra sucursal' });
    }

    // Enable matriz mode if not enabled
    if (!barberia.esMatriz) {
      barberia.esMatriz = true;
    }

    // Create new sucursal
    const nuevaSucursal = {
      nombre: sucursalData.nombre,
      slug: slugNormalizado,
      direccion: sucursalData.direccion || '',
      telefono: sucursalData.telefono || '',
      email: sucursalData.email || '',
      ubicacion: sucursalData.ubicacion || {},
      configuracion: sucursalData.configuracion || {},
      horarios: sucursalData.horarios || {},
      activa: sucursalData.activa !== undefined ? sucursalData.activa : true,
      createdAt: new Date()
    };

    barberia.sucursales.push(nuevaSucursal);

    barberia.historial.push({
      accion: 'sucursal_creada',
      realizadoPor: req.user._id,
      notas: `Sucursal "${nuevaSucursal.nombre}" creada`
    });

    await barberia.save();

    res.status(201).json({
      message: 'Sucursal creada exitosamente',
      sucursal: barberia.sucursales[barberia.sucursales.length - 1]
    });
  } catch (error) {
    console.error('❌ [SUPERADMIN] Error al crear sucursal:', error);
    next(error);
  }
};

// Actualizar sucursal existente
exports.actualizarSucursal = async (req, res, next) => {
  try {
    // This endpoint uses direct model access for now
    // TODO: Create UpdateSucursal use case
    const { id, sucursalId } = req.params;
    const actualizaciones = req.body;

    const Barberia = require('../infrastructure/database/mongodb/models/Barberia');
    const Slug = require('../domain/value-objects/Slug');

    const barberia = await Barberia.findById(id);
    if (!barberia) return res.status(404).json({ message: 'Barbería no encontrada' });

    const sucursal = barberia.sucursales.id(sucursalId);
    if (!sucursal) return res.status(404).json({ message: 'Sucursal no encontrada' });

    // If slug changes, validate uniqueness
    if (actualizaciones.slug && actualizaciones.slug !== sucursal.slug) {
      const slugNormalizado = Slug.normalize(actualizaciones.slug);
      if (!slugNormalizado) {
        return res.status(400).json({ message: 'Slug inválido' });
      }

      const slugExiste = barberia.sucursales.some(
        s => s._id.toString() !== sucursalId && s.slug === slugNormalizado
      );
      if (slugExiste) {
        return res.status(400).json({ message: 'El slug ya existe en otra sucursal' });
      }

      actualizaciones.slug = slugNormalizado;
    }

    // Update fields
    Object.keys(actualizaciones).forEach(key => {
      if (key !== '_id' && key !== 'createdAt') {
        sucursal[key] = actualizaciones[key];
      }
    });

    barberia.historial.push({
      accion: 'sucursal_actualizada',
      realizadoPor: req.user._id,
      notas: `Sucursal "${sucursal.nombre}" actualizada`
    });

    await barberia.save();

    res.json({
      message: 'Sucursal actualizada exitosamente',
      sucursal
    });
  } catch (error) {
    console.error('❌ [SUPERADMIN] Error al actualizar sucursal:', error);
    next(error);
  }
};

// Eliminar sucursal
exports.eliminarSucursal = async (req, res, next) => {
  try {
    // This endpoint uses direct model access for now
    // TODO: Create DeleteSucursal use case
    const { id, sucursalId } = req.params;

    const Barberia = require('../infrastructure/database/mongodb/models/Barberia');

    const barberia = await Barberia.findById(id);
    if (!barberia) return res.status(404).json({ message: 'Barbería no encontrada' });

    const sucursal = barberia.sucursales.id(sucursalId);
    if (!sucursal) return res.status(404).json({ message: 'Sucursal no encontrada' });

    const nombreSucursal = sucursal.nombre;
    sucursal.remove();

    // If no sucursales remain, disable matriz mode
    if (barberia.sucursales.length === 0) {
      barberia.esMatriz = false;
    }

    barberia.historial.push({
      accion: 'sucursal_eliminada',
      realizadoPor: req.user._id,
      notas: `Sucursal "${nombreSucursal}" eliminada`
    });

    await barberia.save();

    res.json({
      message: 'Sucursal eliminada exitosamente'
    });
  } catch (error) {
    console.error('❌ [SUPERADMIN] Error al eliminar sucursal:', error);
    next(error);
  }
};

// Toggle modo matriz (habilitar/deshabilitar multi-sede)
exports.toggleMatriz = async (req, res, next) => {
  try {
    // This endpoint uses direct model access for now
    // TODO: Create ToggleMatriz use case
    const { id } = req.params;
    const { esMatriz } = req.body;

    const Barberia = require('../infrastructure/database/mongodb/models/Barberia');

    const barberia = await Barberia.findById(id);
    if (!barberia) return res.status(404).json({ message: 'Barbería no encontrada' });

    // Cannot enable matriz mode without sucursales
    if (esMatriz && barberia.sucursales.length === 0) {
      return res.status(400).json({ message: 'No se puede habilitar modo matriz sin sucursales' });
    }

    barberia.esMatriz = esMatriz;

    barberia.historial.push({
      accion: esMatriz ? 'matriz_habilitada' : 'matriz_deshabilitada',
      realizadoPor: req.user._id,
      notas: `Modo matriz ${esMatriz ? 'habilitado' : 'deshabilitado'}`
    });

    await barberia.save();

    res.json({
      message: `Modo matriz ${esMatriz ? 'habilitado' : 'deshabilitado'} exitosamente`,
      barberia: {
        id: barberia._id,
        nombre: barberia.nombre,
        esMatriz: barberia.esMatriz
      }
    });
  } catch (error) {
    console.error('❌ [SUPERADMIN] Error al cambiar modo matriz:', error);
    next(error);
  }
};

// =========================================================
// GESTIÓN DE CUENTAS PENDIENTES
// =========================================================

/**
 * Get list of pending accounts awaiting approval
 */
exports.getPendingAccounts = async (req, res, next) => {
  try {
    const GetPendingAccountsUseCase = require('../application/use-cases/auth/GetPendingAccounts');
    const userRepository = container.userRepository;

    const useCase = new GetPendingAccountsUseCase(userRepository);
    const pendingAccounts = await useCase.execute();

    res.json({
      total: pendingAccounts.length,
      accounts: pendingAccounts
    });
  } catch (error) {
    console.error('❌ [SUPERADMIN] Error al obtener cuentas pendientes:', error);
    next(error);
  }
};

/**
 * Approve a pending account
 */
exports.approveAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const approvedBy = req.user._id;

    const ApproveAccountUseCase = require('../application/use-cases/auth/ApproveAccount');
    const userRepository = container.userRepository;
    const barberiaRepository = container.barberiaRepository;
    const emailService = require('../notifications/emailService');

    const useCase = new ApproveAccountUseCase(userRepository, barberiaRepository, emailService);
    const result = await useCase.execute(id, approvedBy);

    res.json({
      message: 'Cuenta aprobada exitosamente',
      user: {
        id: result.user.id,
        nombre: result.user.nombre,
        email: result.user.email,
        estadoCuenta: result.user.estadoCuenta,
        fechaAprobacion: result.user.fechaAprobacion,
        barberiaId: result.user.barberiaId
      },
      barberia: {
        id: result.barberia.id,
        nombre: result.barberia.nombre,
        slug: result.barberia.slug,
        estado: result.barberia.estado,
        fechaFinTrial: result.barberia.fechaFinTrial
      }
    });
  } catch (error) {
    console.error('❌ [SUPERADMIN] Error al aprobar cuenta:', error);
    next(error);
  }
};

/**
 * Reject a pending account
 */
exports.rejectAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { razon } = req.body;
    const userRepository = container.userRepository;

    const updatedUser = await userRepository.updateById(id, {
      estadoCuenta: 'RECHAZADA'
    });

    // TODO: Send rejection email

    res.json({
      message: 'Cuenta rechazada',
      user: {
        id: updatedUser.id,
        nombre: updatedUser.nombre,
        email: updatedUser.email,
        estadoCuenta: updatedUser.estadoCuenta
      }
    });
  } catch (error) {
    console.error('❌ [SUPERADMIN] Error al rechazar cuenta:', error);
    next(error);
  }
};

/**
 * Get audit logs with filters and pagination
 */
exports.getAuditLogs = async (req, res, next) => {
  try {
    const {
      barberiaId,
      userId,
      action,
      severity,
      result,
      resourceType,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      barberiaId,
      userId,
      action,
      severity,
      result,
      resourceType,
      startDate,
      endDate
    };

    const pagination = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    };

    const useCase = container.getAuditLogsUseCase;
    const resultDetails = await useCase.execute(filters, pagination);

    res.json(resultDetails);
  } catch (error) {
    console.error('❌ [SUPERADMIN] Error al obtener audit logs:', error);
    next(error);
  }
};
