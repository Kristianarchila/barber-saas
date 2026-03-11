/**
 * Public Controller (Hexagonal Architecture Version)
 * Acts as an adapter for public-facing endpoints
 */
const container = require('../shared/Container');
const cacheService = require('../infrastructure/cache/CacheService');

// TTLs para endpoints públicos de solo-lectura.
// Escalonados según la frecuencia con que cambia cada recurso.
const TTL = {
    barberia: 5 * 60, // 5 min  — configuración raramente cambia
    barberos: 2 * 60, // 2 min  — pueden ser activados/desactivados
    servicios: 3 * 60, // 3 min  — precios/disponibilidad moderadamente estables
    disponibilidad: 30, // 30 seg — cambia frecuentemente cuando se crean reservas
};

// Base URL para íconos de fallback (los estáticos del frontend)
const FALLBACK_ICON_BASE = process.env.FRONTEND_URL || 'http://localhost:5173';

// ==========================================
// 1) GET BARBERIA BY SLUG
// ==========================================
exports.getBarberiaBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const cacheKey = `pub:barberia:${slug}`;

        const data = await cacheService.wrap(cacheKey, async () => {
            const barberia = await container.getBarberiaBySlugUseCase.execute(slug);
            return {
                _id: barberia.id,
                nombre: barberia.nombre,
                slug: barberia.slug,
                direccion: barberia.direccion,
                telefono: barberia.telefono,
                email: barberia.email,
                configuracion: barberia.configuracion
            };
        }, TTL.barberia);

        res.json(data);
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
        const cacheKey = `pub:barberos:${slug}`;

        const data = await cacheService.wrap(cacheKey, async () => {
            const barberia = await container.getBarberiaBySlugUseCase.execute(slug);
            const barberos = await container.listBarberosUseCase.execute(barberia.id, { activo: true });
            return barberos.map(b => ({
                _id: b.id,
                nombre: b.nombre,
                foto: b.foto,
                descripcion: b.descripcion,
                especialidades: b.especialidades,
                experiencia: b.experiencia
            }));
        }, TTL.barberos);

        res.json(data);
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
        const cacheKey = `pub:servicios:${slug}`;

        const data = await cacheService.wrap(cacheKey, async () => {
            const barberia = await container.getBarberiaBySlugUseCase.execute(slug);
            const servicios = await container.listServiciosUseCase.execute(barberia.id);
            return servicios.map(s => ({
                _id: s.id,
                nombre: s.nombre,
                descripcion: s.descripcion,
                duracion: s.duracion,
                precio: s.precio.amount,
                imagen: s.imagen,
                categoria: s.categoria,
                barberiaId: s.barberiaId,
                activo: s.activo
            }));
        }, TTL.servicios);

        res.json(data);
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

        const cacheKey = `pub:disponibilidad:${slug}:${barberoId}:${fecha}:${servicioId}`;

        const result = await cacheService.wrap(cacheKey, async () => {
            // Get barberia first
            const barberiaUseCase = container.getBarberiaBySlugUseCase;
            const barberia = await barberiaUseCase.execute(slug);

            // Get service to obtain its duration
            const servicio = await container.servicioRepository.findById(servicioId, barberia.id);
            if (!servicio) {
                const err = new Error("Servicio no encontrado");
                err.statusCode = 404;
                throw err;
            }

            // Get available slots (use case expects duracion, not servicioId)
            const useCase = container.getAvailableSlotsUseCase;
            const slots = await useCase.execute({
                barberiaId: barberia.id,
                barberoId,
                duracion: servicio.duracion,
                fecha
            });

            return {
                barberoId,
                fecha,
                servicioId,
                turnosDisponibles: slots
            };
        }, TTL.disponibilidad);

        res.json(result);
    } catch (error) {
        if (error.statusCode === 404) {
            return res.status(404).json({ message: error.message });
        }
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
        // Let error handler middleware handle all errors with proper status codes.
        // ReservationConflictError → 409, ValidationError → 400, etc.
        next(error);
    }
};


// ==========================================
// 6) GET PWA MANIFEST BY SLUG (Multi-Tenant)
// ==========================================
/**
 * Genera un manifest.json dinámico para cada barbería.
 * Permite que cada cliente instale la PWA con el branding de SU barbería
 * (logo, nombre, color) en lugar del genérico de la plataforma.
 *
 * Endpoint: GET /api/public/barberias/:slug/manifest.json
 */
exports.getBarberiaManifest = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const useCase = container.getBarberiaBySlugUseCase;
        const barberia = await useCase.execute(slug);

        const cfg = barberia.configuracion || {};
        const themeColor = cfg.colorPrincipal || '#D4AF37';
        const bgColor = cfg.colorDark || '#000000';
        const nombre = barberia.nombre || 'Barber SaaS';
        const logoUrl = cfg.logoUrl;

        // Construir íconos: preferir logo de Cloudinary, fallback al genérico
        const makeIcon = (src, size) => ({
            src,
            sizes: `${size}x${size}`,
            type: 'image/png',
            purpose: 'any maskable'
        });

        let icons;
        if (logoUrl) {
            const isCloudinary = logoUrl.includes('res.cloudinary.com');
            if (isCloudinary) {
                // Generar variantes de tamaño vía transformaciones de Cloudinary
                const cfUrl = (size) =>
                    logoUrl.replace('/upload/', `/upload/c_fill,w_${size},h_${size},f_png/`);
                icons = [makeIcon(cfUrl(192), 192), makeIcon(cfUrl(512), 512)];
            } else {
                icons = [makeIcon(logoUrl, 192), makeIcon(logoUrl, 512)];
            }
        } else {
            // Sin logo propio → íconos genéricos de la plataforma
            icons = [
                makeIcon(`${FALLBACK_ICON_BASE}/icon-192.png`, 192),
                makeIcon(`${FALLBACK_ICON_BASE}/icon-512.png`, 512)
            ];
        }

        // Shortcut de reserva si hay favicon
        const shortcuts = cfg.faviconUrl ? [{
            name: `Reservar en ${nombre}`,
            url: `/${slug}/book`,
            icons: [{ src: cfg.faviconUrl, sizes: '96x96' }]
        }] : [];

        const manifest = {
            name: nombre,
            short_name: nombre.length > 12 ? nombre.split(' ')[0] : nombre,
            description: cfg.mensajeBienvenida || `Reserva tu turno en ${nombre}`,
            theme_color: themeColor,
            background_color: bgColor,
            display: 'standalone',
            orientation: 'portrait',
            scope: `/${slug}/`,
            start_url: `/${slug}/`,
            lang: 'es',
            icons,
            ...(shortcuts.length ? { shortcuts } : {}),
            screenshots: [{
                src: icons[1].src,
                sizes: '512x512',
                type: 'image/png',
                form_factor: 'narrow',
                label: `Reservas en ${nombre}`
            }]
        };

        // Cache 1 hora, revalidación suave al día
        res.setHeader('Content-Type', 'application/manifest+json');
        res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
        return res.json(manifest);

    } catch (error) {
        if (error.message?.includes('no encontrada') || error.message?.includes('no está disponible')) {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};

// ==========================================
// MARKETPLACE: GET PRODUCTOS DE LA TIENDA
// ==========================================
exports.getProductosTienda = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { categoria, destacado } = req.query;

        // 🏛️ Delegates entirely through use case — no direct model access
        const result = await container.getProductosTiendaUseCase.execute(slug, { categoria, destacado });

        res.json(result);
    } catch (error) {
        const status = error.statusCode || 500;
        if (status !== 500) {
            return res.status(status).json({ message: error.message });
        }
        next(error);
    }
};
