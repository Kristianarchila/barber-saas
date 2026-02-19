const jwt = require("jsonwebtoken");
const User = require("../../infrastructure/database/mongodb/models/User");
const tokenBlacklist = require("../../infrastructure/cache/TokenBlacklist");

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

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.activo) {
      return res.status(401).json({ message: "Usuario inválido" });
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

// 🛡️ Verificar que el usuario es admin de la barbería
exports.esAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (!['BARBERIA_ADMIN', 'SUPER_ADMIN'].includes(req.user.rol)) {
    return res.status(403).json({
      message: "Solo administradores pueden realizar esta acción"
    });
  }

  next();
};
