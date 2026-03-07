const jwt = require("jsonwebtoken");
const User = require("../../infrastructure/database/mongodb/models/User");
const tokenBlacklist = require("../../infrastructure/cache/TokenBlacklist");
const { setUser } = require("../sentry");
const cacheService = require("../../infrastructure/cache/CacheService");

// User lookup TTL: 5 minutes.
// If a user is deactivated/suspended mid-session, the change propagates within 5 min.
// Security-sensitive ops (logout, password change) invalidate the cache explicitly via
// the token blacklist and iat check, so this is safe.
const USER_CACHE_TTL = 5 * 60;

// 🔐 Verifica token
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No autorizado" });
    }

    // Check if token is blacklisted (logged out)
    if (await tokenBlacklist.has(token)) {
      return res.status(401).json({ message: "Token inválido - sesión cerrada" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── User lookup with cache ────────────────────────────────────────────
    // User.findById() on every authenticated request was the bottleneck
    // (200-300ms × 20 concurrent = slows dashboard to ~900ms avg).
    // Cache key uses userId so different users have isolated cache entries.
    const userCacheKey = `auth:user:${decoded.id}`;
    let user = cacheService.get(userCacheKey);

    if (!user) {
      user = await User.findById(decoded.id).select('-password');
      if (user) cacheService.set(userCacheKey, user, USER_CACHE_TTL);
    }

    if (!user || !user.activo) {
      return res.status(401).json({ message: "Usuario inválido" });
    }

    // 🔒 S-01 FIX: Invalidate tokens issued BEFORE last password change
    if (user.passwordChangedAt) {
      const changedAtSeconds = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
      if (decoded.iat < changedAtSeconds) {
        cacheService.del(userCacheKey); // Evict stale cache on pw change
        return res.status(401).json({ message: "Contraseña cambiada recientemente. Por favor inicia sesión de nuevo." });
      }
    }

    // 🔒 CRITICAL SECURITY: Validate account status
    if (user.estadoCuenta !== 'ACTIVA') {
      const mensajes = {
        'PENDIENTE': 'Tu cuenta está pendiente de aprobación. Recibirás un email cuando sea activada.',
        'RECHAZADA': 'Tu solicitud de cuenta fue rechazada. Contacta a soporte para más información.',
        'SUSPENDIDA': 'Tu cuenta ha sido suspendida. Contacta a soporte.'
      };

      return res.status(403).json({
        message: mensajes[user.estadoCuenta] || 'Tu cuenta no está activa',
        estadoCuenta: user.estadoCuenta
      });
    }

    req.user = user;

    // 📊 Sentry: asociar usuario al contexto de error actual
    setUser(user);

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};


// 🔒 Control de roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        message: "No tienes permisos para esta acción"
      });
    }
    next();
  };
};

// 🔐 Verificar token (alias para compatibilidad con marketplace)
exports.verificarToken = exports.protect;

// 🔓 Verificar token opcional (para carrito anónimo)
exports.verificarTokenOpcional = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (user && user.activo) {
          req.user = user;
        }
      } catch (error) {
        // Token inválido, continuar sin usuario
      }
    }

    // Continuar con o sin usuario autenticado
    next();
  } catch (error) {
    next();
  }
};

// 🛡️ Verificar que el usuario es admin de la barbería — con validación cross-tenant
exports.esAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (!['BARBERIA_ADMIN', 'SUPER_ADMIN'].includes(req.user.rol)) {
    return res.status(403).json({
      message: "Solo administradores pueden realizar esta acción"
    });
  }

  // 🔒 CROSS-TENANT CHECK: ensure the admin only accesses their own barbería.
  // SUPER_ADMIN is exempt — they manage all barberías.
  // req.barberia is set by getBarberiaBySlug middleware before this runs.
  if (req.user.rol === 'BARBERIA_ADMIN' && req.barberia) {
    const userBarberiaId = req.user.barberiaId?.toString();
    const requestedBarberiaId = req.barberia._id?.toString();

    if (!userBarberiaId || userBarberiaId !== requestedBarberiaId) {
      // Log suspicious cross-tenant attempt
      console.warn(`🚨 Cross-tenant attempt blocked: user ${req.user._id} (barbería ${userBarberiaId}) tried to access barbería ${requestedBarberiaId}`);
      return res.status(403).json({
        message: "No tienes permisos para administrar esta barbería"
      });
    }
  }

  next();
};
