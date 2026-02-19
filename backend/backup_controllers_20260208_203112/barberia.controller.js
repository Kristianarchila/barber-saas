// backend/src/controllers/barberia.controller.js
const Barberia = require("../models/Barberia");
const slugify = require("../utils/slugify");

// Crear barbería (solo SUPER_ADMIN)
exports.createBarberia = async (req, res, next) => {
  try {
    const { nombre, direccion, telefono, email } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: "El nombre de la barbería es obligatorio" });
    }
    if (!email) {
      return res.status(400).json({ message: "El email de la barbería es obligatorio" });
    }

    // Generar slug desde nombre
    const baseSlug = slugify(nombre);
    if (!baseSlug) {
      return res.status(400).json({ message: "No se pudo generar slug desde el nombre" });
    }

    // Evitar colisión de slug
    let slug = baseSlug;
    let i = 1;
    while (await Barberia.exists({ slug })) {
      slug = `${baseSlug}-${i}`;
      i++;
    }

    // Evitar email duplicado
    const emailExists = await Barberia.exists({ email: String(email).toLowerCase().trim() });
    if (emailExists) {
      return res.status(409).json({ message: "Ya existe una barbería con ese email" });
    }

    const barberia = await Barberia.create({
      nombre,
      slug,
      email: String(email).toLowerCase().trim(),
      direccion,
      telefono
    });

    return res.status(201).json({
      message: "Barbería creada",
      barberia
    });
  } catch (error) {
    next(error);
  }
};

// Listar todas las barberías (solo SUPER_ADMIN)
exports.getBarberias = async (req, res, next) => {
  try {
    const barberias = await Barberia.find().sort({ createdAt: -1 });

    res.json({
      total: barberias.length,
      barberias
    });
  } catch (error) {
    next(error);
  }
};

// Obtener barbería por ID
exports.getBarberiaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const barberia = await Barberia.findById(id);

    if (!barberia) {
      return res.status(404).json({ message: "Barbería no encontrada" });
    }

    res.json({ barberia });
  } catch (error) {
    next(error);
  }
};

// ✅ NUEVO: Obtener configuración de email (solo ADMIN de su barbería)
exports.getConfiguracionEmail = async (req, res, next) => {
  try {
    const barberiaId = req.user?.barberiaId;
    if (!barberiaId) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const barberia = await Barberia.findById(barberiaId).select("configuracion nombre email slug");
    if (!barberia) {
      return res.status(404).json({ message: "Barbería no encontrada" });
    }

    return res.json({
      config: {
        emailNotificaciones: barberia.configuracion?.emailNotificaciones || "",
        nombreParaEmails: barberia.configuracion?.nombreParaEmails || "",
        isConfigured: Boolean(barberia.configuracion?.emailNotificaciones)
      }
    });
  } catch (error) {
    next(error);
  }
};

// ✅ NUEVO: Actualizar configuración general (Logo, Colores, Galería, Redes)
exports.actualizarConfiguracionGeneral = async (req, res, next) => {
  try {
    const barberiaId = req.user?.barberiaId;
    if (!barberiaId) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const {
      nombre,
      direccion,
      telefono,
      colorPrincipal,
      colorAccent,
      logoUrl,
      bannerUrl,
      mensajeBienvenida,
      heroTitle,
      badge,
      ctaPrimary,
      ctaSecondary,
      galeria,
      instagram,
      facebook,
      googleMapsUrl,
      seoTitle,
      seoDescription,
      faviconUrl,
      analyticsId,
      pixelId,
      colorSuccess,
      colorWarning,
      colorLight,
      colorDark,
      fontFamily,
      fontHeading
    } = req.body;

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (direccion) updateData.direccion = direccion;
    if (telefono) updateData.telefono = telefono;

    // Configuración anidada
    if (colorPrincipal) updateData["configuracion.colorPrincipal"] = colorPrincipal;
    if (colorAccent) updateData["configuracion.colorAccent"] = colorAccent;
    if (logoUrl !== undefined) updateData["configuracion.logoUrl"] = logoUrl;
    if (bannerUrl !== undefined) updateData["configuracion.bannerUrl"] = bannerUrl;
    if (mensajeBienvenida !== undefined) updateData["configuracion.mensajeBienvenida"] = mensajeBienvenida;
    if (heroTitle !== undefined) updateData["configuracion.heroTitle"] = heroTitle;
    if (badge !== undefined) updateData["configuracion.badge"] = badge;
    if (ctaPrimary !== undefined) updateData["configuracion.ctaPrimary"] = ctaPrimary;
    if (ctaSecondary !== undefined) updateData["configuracion.ctaSecondary"] = ctaSecondary;
    if (galeria) updateData["configuracion.galeria"] = galeria;
    if (instagram !== undefined) updateData["configuracion.instagram"] = instagram;
    if (facebook !== undefined) updateData["configuracion.facebook"] = facebook;
    if (googleMapsUrl !== undefined) updateData["configuracion.googleMapsUrl"] = googleMapsUrl;
    if (seoTitle !== undefined) updateData["configuracion.seoTitle"] = seoTitle;
    if (seoDescription !== undefined) updateData["configuracion.seoDescription"] = seoDescription;
    if (faviconUrl !== undefined) updateData["configuracion.faviconUrl"] = faviconUrl;
    if (analyticsId !== undefined) updateData["configuracion.analyticsId"] = analyticsId;
    if (pixelId !== undefined) updateData["configuracion.pixelId"] = pixelId;

    // New Theme Fields
    if (colorSuccess) updateData["configuracion.colorSuccess"] = colorSuccess;
    if (colorWarning) updateData["configuracion.colorWarning"] = colorWarning;
    if (colorLight) updateData["configuracion.colorLight"] = colorLight;
    if (colorDark) updateData["configuracion.colorDark"] = colorDark;
    if (fontFamily) updateData["configuracion.fontFamily"] = fontFamily;
    if (fontHeading) updateData["configuracion.fontHeading"] = fontHeading;

    const barberia = await Barberia.findByIdAndUpdate(
      barberiaId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!barberia) {
      return res.status(404).json({ message: "Barbería no encontrada" });
    }

    res.json({
      message: "Configuración actualizada correctamente",
      barberia
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar configuración de email (solo ADMIN de la propia barbería)
exports.actualizarConfiguracionEmail = async (req, res, next) => {
  try {
    const { emailNotificaciones, nombreParaEmails, emailPassword, emailProvider, smtpConfig } = req.body;
    const barberiaId = req.user?.barberiaId;

    if (!barberiaId) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // Validación mínima
    if (!emailNotificaciones) {
      return res.status(400).json({ message: "emailNotificaciones es obligatorio" });
    }

    const updateData = {
      "configuracion.emailNotificaciones": String(emailNotificaciones).toLowerCase().trim(),
      "configuracion.nombreParaEmails": String(nombreParaEmails || "").trim()
    };

    // Si se proporciona contraseña, encriptarla
    if (emailPassword) {
      const { encrypt } = require("../utils/encryption");
      const encryptedData = encrypt(emailPassword);
      updateData["configuracion.emailPassword"] = encryptedData;
    }

    // Actualizar proveedor y config SMTP si se proporcionan
    if (emailProvider) {
      updateData["configuracion.emailProvider"] = emailProvider;
    }
    if (smtpConfig) {
      updateData["configuracion.smtpConfig"] = smtpConfig;
    }

    const barberia = await Barberia.findByIdAndUpdate(
      barberiaId,
      { $set: updateData },
      { new: true }
    );

    if (!barberia) {
      return res.status(404).json({ message: "Barbería no encontrada" });
    }

    res.json({
      message: "Configuración de email actualizada correctamente",
      barberia
    });
  } catch (error) {
    next(error);
  }
};

// ✅ NUEVO: Probar configuración de email antes de guardar
exports.testConfiguracionEmail = async (req, res, next) => {
  try {
    const { emailNotificaciones, emailPassword, emailProvider, smtpConfig } = req.body;
    const nodemailer = require("nodemailer");

    // Crear transportador temporal
    let config = {
      service: emailProvider || 'gmail',
      auth: {
        user: emailNotificaciones,
        pass: emailPassword
      }
    };

    if (emailProvider === 'smtp' && smtpConfig?.host) {
      config = {
        host: smtpConfig.host,
        port: smtpConfig.port || 587,
        secure: smtpConfig.secure || false,
        auth: {
          user: emailNotificaciones,
          pass: emailPassword
        }
      };
    }

    const transporter = nodemailer.createTransport(config);

    // Verificar conexión
    await transporter.verify();

    // Enviar email de prueba
    await transporter.sendMail({
      from: `"Test" <${emailNotificaciones}>`,
      to: emailNotificaciones, // Se envía a sí mismo
      subject: '✅ Configuración de Email Exitosa - Barber SaaS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">¡Configuración exitosa!</h2>
          <p>Tu servidor de email está correctamente configurado.</p>
          <p>Ahora puedes enviar notificaciones a tus clientes.</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">Este es un email de prueba de Barber SaaS</p>
        </div>
      `
    });

    return res.json({
      success: true,
      message: 'Configuración válida. Email de prueba enviado a ' + emailNotificaciones
    });

  } catch (error) {
    console.error('❌ Error en test de email:', error);

    return res.status(400).json({
      success: false,
      message: 'Error al validar configuración',
      error: error.message,
      hint: getEmailErrorHint(error)
    });
  }
};

/**
 * Ayuda al usuario a entender errores comunes
 */
function getEmailErrorHint(error) {
  const msg = error.message.toLowerCase();

  if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
    return 'Usuario o contraseña incorrectos. Si usas Gmail, asegúrate de usar una "App Password" (no tu contraseña normal).';
  }
  if (msg.includes('self signed certificate')) {
    return 'Problema con certificado SSL. Intenta con secure: false en la configuración.';
  }
  if (msg.includes('econnrefused') || msg.includes('connection refused')) {
    return 'No se pudo conectar al servidor SMTP. Verifica el host y puerto.';
  }
  if (msg.includes('timeout')) {
    return 'Tiempo de espera agotado. Verifica tu conexión a internet y el servidor SMTP.';
  }

  return 'Verifica tus credenciales y configuración SMTP. Para Gmail, usa smtp.gmail.com puerto 587.';
}

// Obtener MI barbería (solo BARBERIA_ADMIN)
exports.getMiBarberia = async (req, res, next) => {
  try {
    const barberiaId = req.user?.barberiaId;

    if (!barberiaId) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const barberia = await Barberia.findById(barberiaId).select(
      "nombre slug email direccion telefono configuracion"
    );

    if (!barberia) {
      return res.status(404).json({ message: "Barbería no encontrada" });
    }

    res.json({ barberia });
  } catch (error) {
    next(error);
  }
};
