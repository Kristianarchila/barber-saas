// backend/src/controllers/superAdmin.controller.js
const Barberia = require("../models/Barberia");
const User = require("../models/User");
const Barbero = require("../models/Barbero");
const Reserva = require("../models/Reserva");
const bcrypt = require("bcrypt");

// Helpers
const normalizarSlug = (slug) =>
  String(slug || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// =========================================================
// ESTADÍSTICAS GENERALES
// =========================================================
exports.obtenerEstadisticas = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== "production") {
      console.log("📊 [SUPERADMIN] obtenerEstadisticas - User:", req.user?.nombre, "Rol:", req.user?.rol);
    }

    const totalBarberias = await Barberia.countDocuments();
    const activas = await Barberia.countDocuments({ estado: "activa" });
    const trial = await Barberia.countDocuments({ estado: "trial" });
    const suspendidas = await Barberia.countDocuments({ estado: "suspendida" });

    // Barberías próximas a vencer (próximos 5 días)
    const hoy = new Date();
    const en5Dias = new Date();
    en5Dias.setDate(en5Dias.getDate() + 5);

    const proximasVencer = await Barberia.find({
      estado: { $in: ["activa", "trial"] },
      proximoPago: { $lte: en5Dias, $gte: hoy },
    })
      .select("nombre proximoPago email estado")
      .sort({ proximoPago: 1 });

    // Nuevas barberías este mes
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const nuevasEsteMes = await Barberia.countDocuments({
      createdAt: { $gte: inicioMes },
    });

    res.json({
      totalBarberias,
      activas,
      trial,
      suspendidas,
      nuevasEsteMes,
      proximasVencer: proximasVencer.map((b) => ({
        id: b._id,
        nombre: b.nombre,
        email: b.email,
        estado: b.estado,
        proximoPago: b.proximoPago,
        diasRestantes: b.proximoPago
          ? Math.ceil((new Date(b.proximoPago) - hoy) / (1000 * 60 * 60 * 24))
          : null,
      })),
    });
  } catch (error) {
    console.error("❌ [SUPERADMIN] Error al obtener estadísticas:", error);
    next(error);
  }
};

// =========================================================
// LISTAR TODAS LAS BARBERÍAS
// =========================================================
exports.obtenerBarberias = async (req, res, next) => {
  try {
    const { estado, busqueda, page = 1, limit = 10 } = req.query;

    let filtro = {};

    if (estado) filtro.estado = estado;

    if (busqueda) {
      filtro.$or = [
        { nombre: { $regex: busqueda, $options: "i" } },
        { email: { $regex: busqueda, $options: "i" } },
        { slug: { $regex: busqueda, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [barberias, total] = await Promise.all([
      Barberia.find(filtro)
        .select("-historial")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Barberia.countDocuments(filtro),
    ]);

    // Enriquecer con admin + stats (OK por ahora; luego optimizamos con aggregate)
    const barberiasConAdmin = await Promise.all(
      barberias.map(async (barberia) => {
        const admin = await User.findOne({
          barberiaId: barberia._id,
          rol: "BARBERIA_ADMIN",
        }).select("nombre email telefono activo");

        const [totalBarberos, totalReservas] = await Promise.all([
          Barbero.countDocuments({ barberiaId: barberia._id }),
          Reserva.countDocuments({ barberiaId: barberia._id }),
        ]);

        return {
          ...barberia.toObject(),
          admin: admin || null,
          stats: { totalBarberos, totalReservas },
        };
      })
    );

    res.json({
      barberias: barberiasConAdmin,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("❌ [SUPERADMIN] Error al obtener barberías:", error);
    next(error);
  }
};

// =========================================================
// OBTENER UNA BARBERÍA ESPECÍFICA
// =========================================================
exports.obtenerBarberia = async (req, res, next) => {
  try {
    const { id } = req.params;

    const barberia = await Barberia.findById(id);
    if (!barberia) return res.status(404).json({ message: "Barbería no encontrada" });

    const admin = await User.findOne({
      barberiaId: barberia._id,
      rol: "BARBERIA_ADMIN",
    }).select("nombre email telefono activo");

    const [totalBarberos, totalReservas, reservasCompletadas, barberos] = await Promise.all([
      Barbero.countDocuments({ barberiaId: barberia._id }),
      Reserva.countDocuments({ barberiaId: barberia._id }),
      Reserva.countDocuments({ barberiaId: barberia._id, estado: "COMPLETADA" }),
      Barbero.find({ barberiaId: barberia._id }).select("nombre activo").limit(10),
    ]);

    res.json({
      ...barberia.toObject(),
      admin,
      stats: {
        totalBarberos,
        totalReservas,
        reservasCompletadas,
        barberos,
      },
    });
  } catch (error) {
    console.error("❌ [SUPERADMIN] Error al obtener barbería:", error);
    next(error);
  }
};

// =========================================================
// CREAR NUEVA BARBERÍA CON ADMIN
// =========================================================
exports.crearBarberia = async (req, res, next) => {
  try {
    const {
      // Barbería
      nombre,
      slug,
      email,
      telefono,
      rut,
      direccion,
      plan,
      diasTrial = 14,
      // Admin
      adminNombre,
      adminEmail,
      adminPassword,
      adminTelefono,
    } = req.body;

    if (!nombre || !slug || !email || !adminNombre || !adminEmail || !adminPassword) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const slugNormalizado = normalizarSlug(slug);
    if (!slugNormalizado) {
      return res.status(400).json({ message: "Slug inválido" });
    }

    // Slug único
    const slugExiste = await Barberia.findOne({ slug: slugNormalizado });
    if (slugExiste) return res.status(400).json({ message: "El slug ya está en uso" });

    // Email barbería único (recomendado)
    const emailBarberia = String(email).toLowerCase().trim();
    const emailBarberiaExiste = await Barberia.findOne({ email: emailBarberia });
    if (emailBarberiaExiste) return res.status(400).json({ message: "El email de la barbería ya está en uso" });

    // Email admin único
    const adminEmailNorm = String(adminEmail).toLowerCase().trim();
    const adminEmailExiste = await User.findOne({ email: adminEmailNorm });
    if (adminEmailExiste) return res.status(400).json({ message: "El email del administrador ya está registrado" });

    // Trial
    const fechaFinTrial = new Date();
    fechaFinTrial.setDate(fechaFinTrial.getDate() + Number(diasTrial));

    // ✅ CONFIGURACIÓN PREMIUM POR DEFECTO (Barber Pole Theme)
    const configuracionPremium = {
      // Colores del tema Barber Pole
      colorPrincipal: '#cc2b2b',      // Rojo barber pole
      colorAccent: '#1e3a8a',         // Azul barber pole

      // Textos profesionales por defecto
      heroTitle: 'REDEFINIENDO EL ESTILO MASCULINO',
      mensajeBienvenida: 'Más que un corte, una experiencia. Descubre la excelencia en cada detalle.',
      badge: 'TRADICIÓN Y EXCELENCIA',
      ctaPrimary: 'Reservar Turno',
      ctaSecondary: 'Ver Servicios',

      // Imágenes placeholder de alta calidad (barbería profesional)
      logoUrl: '', // El dueño subirá su logo
      bannerUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80',
      galeria: [
        'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80',
        'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80',
        'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1200&q=80'
      ],

      // Redes sociales (placeholder para que el dueño las configure)
      instagram: '',
      facebook: '',
      googleMapsUrl: '',

      // SEO básico
      seoTitle: `${nombre} - Barbería Profesional`,
      seoDescription: `Descubre ${nombre}, tu barbería de confianza. Servicios profesionales de corte, barba y estilo masculino.`,

      // Template moderno
      template: 'modern',

      // Notificaciones habilitadas por defecto
      notificaciones: {
        emailEnabled: true,
        pushEnabled: true,
        whatsappEnabled: false,
        reminderHoursBefore: 24,
        confirmacionReserva: true,
        recordatorioReserva: true,
        cancelacionReserva: true
      }
    };

    // Crear barbería con configuración premium
    const nuevaBarberia = new Barberia({
      nombre,
      slug: slugNormalizado,
      email: emailBarberia,
      telefono,
      rut,
      direccion,
      plan: plan || "basico",
      estado: "trial",
      fechaFinTrial,
      proximoPago: fechaFinTrial,
      configuracion: configuracionPremium, // ✅ Configuración premium incluida
      historial: [
        {
          accion: "creada",
          realizadoPor: req.user._id,
          notas: `Barbería creada con ${diasTrial} días de trial y tema premium Barber Pole`,
        },
      ],
    });

    await nuevaBarberia.save();

    // Crear admin (HASH correcto)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const nuevoAdmin = new User({
      nombre: adminNombre,
      email: adminEmailNorm,
      password: passwordHash, // ✅ NO texto plano
      telefono: adminTelefono,
      rol: "BARBERIA_ADMIN",
      barberiaId: nuevaBarberia._id,
      barberiaIds: [nuevaBarberia._id], // También en el array multisede
      activo: true,
    });

    await nuevoAdmin.save();

    res.status(201).json({
      message: "Barbería creada exitosamente",
      barberia: {
        id: nuevaBarberia._id,
        nombre: nuevaBarberia.nombre,
        slug: nuevaBarberia.slug,
        estado: nuevaBarberia.estado,
        fechaFinTrial: nuevaBarberia.fechaFinTrial,
      },
      admin: {
        nombre: nuevoAdmin.nombre,
        email: nuevoAdmin.email,
      },
    });
  } catch (error) {
    console.error("❌ [SUPERADMIN] Error al crear barbería:", error);
    next(error);
  }
};

// =========================================================
// ACTUALIZAR DATOS DE BARBERÍA
// =========================================================
exports.actualizarBarberia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const actualizaciones = { ...req.body };

    delete actualizaciones._id;
    delete actualizaciones.historial;
    delete actualizaciones.createdAt;
    delete actualizaciones.updatedAt;

    const barberia = await Barberia.findById(id);
    if (!barberia) return res.status(404).json({ message: "Barbería no encontrada" });

    // Si cambia slug: normalizar + validar único
    if (actualizaciones.slug && actualizaciones.slug !== barberia.slug) {
      const slugNuevo = normalizarSlug(actualizaciones.slug);
      if (!slugNuevo) return res.status(400).json({ message: "Slug inválido" });

      const slugExiste = await Barberia.findOne({ slug: slugNuevo, _id: { $ne: id } });
      if (slugExiste) return res.status(400).json({ message: "El slug ya está en uso" });

      actualizaciones.slug = slugNuevo;
    }

    // Email normalizado si viene
    if (actualizaciones.email) {
      actualizaciones.email = String(actualizaciones.email).toLowerCase().trim();
    }

    Object.assign(barberia, actualizaciones);

    barberia.historial.push({
      accion: "actualizada",
      realizadoPor: req.user._id,
      notas: "Datos de barbería actualizados",
    });

    await barberia.save();

    res.json({ message: "Barbería actualizada exitosamente", barberia });
  } catch (error) {
    console.error("❌ [SUPERADMIN] Error al actualizar barbería:", error);
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

    if (!["trial", "activa", "suspendida"].includes(estado)) {
      return res.status(400).json({ message: "Estado inválido. Debe ser: trial, activa o suspendida" });
    }

    const barberia = await Barberia.findById(id);
    if (!barberia) return res.status(404).json({ message: "Barbería no encontrada" });

    const estadoAnterior = barberia.estado;
    barberia.estado = estado;

    if (estado === "activa") {
      const proximoPago = new Date();
      proximoPago.setDate(proximoPago.getDate() + 30);
      barberia.proximoPago = proximoPago;
    }

    barberia.historial.push({
      accion: `${estadoAnterior} → ${estado}`,
      realizadoPor: req.user._id,
      notas: notas || "Cambio de estado manual desde panel SUPER_ADMIN",
    });

    await barberia.save();

    res.json({
      message:
        estado === "activa" ? "Barbería activada exitosamente" : estado === "suspendida" ? "Barbería suspendida exitosamente" : "Barbería en trial",
      barberia: {
        id: barberia._id,
        nombre: barberia.nombre,
        estado: barberia.estado,
        proximoPago: barberia.proximoPago,
      },
    });
  } catch (error) {
    console.error("❌ [SUPERADMIN] Error al cambiar estado:", error);
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

    const barberia = await Barberia.findById(id);
    if (!barberia) return res.status(404).json({ message: "Barbería no encontrada" });

    const base = barberia.proximoPago ? new Date(barberia.proximoPago) : new Date();
    const nuevaFecha = new Date(base);
    nuevaFecha.setDate(nuevaFecha.getDate() + Number(dias));

    barberia.proximoPago = nuevaFecha;

    barberia.historial.push({
      accion: "plazo_extendido",
      realizadoPor: req.user._id,
      notas: notas || `Plazo extendido ${dias} días hasta ${nuevaFecha.toISOString().split("T")[0]}`,
    });

    await barberia.save();

    res.json({
      message: `Plazo extendido ${dias} días`,
      barberia: {
        id: barberia._id,
        nombre: barberia.nombre,
        proximoPago: barberia.proximoPago,
      },
    });
  } catch (error) {
    console.error("❌ [SUPERADMIN] Error al extender plazo:", error);
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

    if (!confirmar) {
      return res.status(400).json({ message: "Debes confirmar la eliminación enviando { confirmar: true }" });
    }

    const barberia = await Barberia.findById(id);
    if (!barberia) return res.status(404).json({ message: "Barbería no encontrada" });

    barberia.estado = "suspendida"; // ✅ solo estado, NO "activa"

    barberia.historial.push({
      accion: "eliminada",
      realizadoPor: req.user._id,
      notas: "Barbería suspendida desde panel SUPER_ADMIN",
    });

    await barberia.save();

    await User.updateMany({ barberiaId: id }, { activo: false });

    res.json({
      message: "Barbería suspendida exitosamente",
      barberia: {
        id: barberia._id,
        nombre: barberia.nombre,
        estado: barberia.estado,
      },
    });
  } catch (error) {
    console.error("❌ [SUPERADMIN] Error al eliminar barbería:", error);
    next(error);
  }
};

// =========================================================
// HISTORIAL
// =========================================================
exports.obtenerHistorial = async (req, res, next) => {
  try {
    const { id } = req.params;

    const barberia = await Barberia.findById(id)
      .select("nombre historial")
      .populate("historial.realizadoPor", "nombre email");

    if (!barberia) return res.status(404).json({ message: "Barbería no encontrada" });

    res.json({
      nombre: barberia.nombre,
      historial: barberia.historial.sort((a, b) => b.fecha - a.fecha),
    });
  } catch (error) {
    console.error("❌ [SUPERADMIN] Error al obtener historial:", error);
    next(error);
  }
};

exports.getFinanzasGlobales = async (req, res, next) => {
  try {
    const reservas = await Reserva.find({
      estado: "COMPLETADA"
    }).populate("servicioId", "precio");

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
    const { busqueda } = req.query;
    let filtro = { rol: "BARBERIA_ADMIN" };

    if (busqueda) {
      filtro.$or = [
        { nombre: { $regex: busqueda, $options: "i" } },
        { email: { $regex: busqueda, $options: "i" } }
      ];
    }

    const admins = await User.find(filtro)
      .populate("barberiaId", "nombre slug")
      .populate("barberiaIds", "nombre slug")
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(admins);
  } catch (error) {
    next(error);
  }
};

exports.actualizarSedesAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { barberiaIds } = req.body; // Array de IDs

    if (!Array.isArray(barberiaIds)) {
      return res.status(400).json({ message: "barberiaIds debe ser un array" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    user.barberiaIds = barberiaIds;

    // Si el array no está vacío y el barberiaId actual no está en él, actualizamos el principal
    if (barberiaIds.length > 0 && (!user.barberiaId || !barberiaIds.includes(user.barberiaId.toString()))) {
      user.barberiaId = barberiaIds[0];
    }

    await user.save();

    res.json({ message: "Sedes actualizadas correctamente", user });
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

    const barberia = await Barberia.findById(id).select('nombre esMatriz sucursales');
    if (!barberia) return res.status(404).json({ message: "Barbería no encontrada" });

    res.json({
      esMatriz: barberia.esMatriz,
      sucursales: barberia.sucursales || []
    });
  } catch (error) {
    console.error("❌ [SUPERADMIN] Error al obtener sucursales:", error);
    next(error);
  }
};

// Crear nueva sucursal
exports.crearSucursal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sucursalData = req.body;

    const barberia = await Barberia.findById(id);
    if (!barberia) return res.status(404).json({ message: "Barbería no encontrada" });

    // Validar campos requeridos
    if (!sucursalData.nombre || !sucursalData.slug) {
      return res.status(400).json({ message: "Nombre y slug son requeridos" });
    }

    // Normalizar slug
    const slugNormalizado = normalizarSlug(sucursalData.slug);
    if (!slugNormalizado) {
      return res.status(400).json({ message: "Slug inválido" });
    }

    // Verificar que el slug sea único dentro de las sucursales
    const slugExiste = barberia.sucursales.some(s => s.slug === slugNormalizado);
    if (slugExiste) {
      return res.status(400).json({ message: "El slug ya existe en otra sucursal" });
    }

    // Habilitar modo matriz si no está habilitado
    if (!barberia.esMatriz) {
      barberia.esMatriz = true;
    }

    // Crear nueva sucursal
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
      accion: "sucursal_creada",
      realizadoPor: req.user._id,
      notas: `Sucursal "${nuevaSucursal.nombre}" creada`
    });

    await barberia.save();

    res.status(201).json({
      message: "Sucursal creada exitosamente",
      sucursal: barberia.sucursales[barberia.sucursales.length - 1]
    });
  } catch (error) {
    console.error("❌ [SUPERADMIN] Error al crear sucursal:", error);
    next(error);
  }
};

// Actualizar sucursal existente
exports.actualizarSucursal = async (req, res, next) => {
  try {
    const { id, sucursalId } = req.params;
    const actualizaciones = req.body;

    const barberia = await Barberia.findById(id);
    if (!barberia) return res.status(404).json({ message: "Barbería no encontrada" });

    const sucursal = barberia.sucursales.id(sucursalId);
    if (!sucursal) return res.status(404).json({ message: "Sucursal no encontrada" });

    // Si cambia el slug, validar que sea único
    if (actualizaciones.slug && actualizaciones.slug !== sucursal.slug) {
      const slugNormalizado = normalizarSlug(actualizaciones.slug);
      if (!slugNormalizado) {
        return res.status(400).json({ message: "Slug inválido" });
      }

      const slugExiste = barberia.sucursales.some(
        s => s._id.toString() !== sucursalId && s.slug === slugNormalizado
      );
      if (slugExiste) {
        return res.status(400).json({ message: "El slug ya existe en otra sucursal" });
      }

      actualizaciones.slug = slugNormalizado;
    }

    // Actualizar campos
    Object.keys(actualizaciones).forEach(key => {
      if (key !== '_id' && key !== 'createdAt') {
        sucursal[key] = actualizaciones[key];
      }
    });

    barberia.historial.push({
      accion: "sucursal_actualizada",
      realizadoPor: req.user._id,
      notas: `Sucursal "${sucursal.nombre}" actualizada`
    });

    await barberia.save();

    res.json({
      message: "Sucursal actualizada exitosamente",
      sucursal
    });
  } catch (error) {
    console.error("❌ [SUPERADMIN] Error al actualizar sucursal:", error);
    next(error);
  }
};

// Eliminar sucursal
exports.eliminarSucursal = async (req, res, next) => {
  try {
    const { id, sucursalId } = req.params;

    const barberia = await Barberia.findById(id);
    if (!barberia) return res.status(404).json({ message: "Barbería no encontrada" });

    const sucursal = barberia.sucursales.id(sucursalId);
    if (!sucursal) return res.status(404).json({ message: "Sucursal no encontrada" });

    const nombreSucursal = sucursal.nombre;
    sucursal.remove();

    // Si ya no quedan sucursales, desactivar modo matriz
    if (barberia.sucursales.length === 0) {
      barberia.esMatriz = false;
    }

    barberia.historial.push({
      accion: "sucursal_eliminada",
      realizadoPor: req.user._id,
      notas: `Sucursal "${nombreSucursal}" eliminada`
    });

    await barberia.save();

    res.json({
      message: "Sucursal eliminada exitosamente"
    });
  } catch (error) {
    console.error("❌ [SUPERADMIN] Error al eliminar sucursal:", error);
    next(error);
  }
};

// Toggle modo matriz (habilitar/deshabilitar multi-sede)
exports.toggleMatriz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { esMatriz } = req.body;

    const barberia = await Barberia.findById(id);
    if (!barberia) return res.status(404).json({ message: "Barbería no encontrada" });

    // Si se desactiva modo matriz y hay sucursales, advertir
    if (!esMatriz && barberia.sucursales.length > 0) {
      return res.status(400).json({
        message: "No se puede desactivar el modo matriz mientras existan sucursales. Elimina todas las sucursales primero."
      });
    }

    barberia.esMatriz = esMatriz;

    barberia.historial.push({
      accion: esMatriz ? "modo_matriz_activado" : "modo_matriz_desactivado",
      realizadoPor: req.user._id,
      notas: `Modo multi-sede ${esMatriz ? 'activado' : 'desactivado'}`
    });

    await barberia.save();

    res.json({
      message: `Modo multi-sede ${esMatriz ? 'activado' : 'desactivado'} exitosamente`,
      esMatriz: barberia.esMatriz
    });
  } catch (error) {
    console.error("❌ [SUPERADMIN] Error al cambiar modo matriz:", error);
    next(error);
  }
};
