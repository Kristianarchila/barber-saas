const Barberia = require("../models/Barberia");
const Barbero = require("../models/Barbero");
const Servicio = require("../models/Servicio");
const Horario = require("../models/Horario");
const { horaToMin, minToHora, sumarMinutos } = require("../utils/dateUtils");

// =========================================================
// OBTENER BARBERÍA POR SLUG (página principal pública)
// =========================================================
exports.getBarberiaBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        // Buscar barbería por slug
        const barberia = await Barberia.findOne({
            slug: slug.toLowerCase(),
            activa: true // Solo barberías activas
        });

        if (!barberia) {
            return res.status(404).json({
                message: "Barbería no encontrada"
            });
        }

        // Verificar que esté activa (no suspendida)
        if (barberia.estado === 'suspendida') {
            return res.status(403).json({
                message: "Esta barbería no está disponible actualmente"
            });
        }

        // Devolver datos básicos de la barbería
        res.json({
            _id: barberia._id,
            nombre: barberia.nombre,
            slug: barberia.slug,
            direccion: barberia.direccion,
            telefono: barberia.telefono,
            email: barberia.email,
            configuracion: barberia.configuracion
        });

    } catch (error) {
        console.error("Error al obtener barbería por slug:", error);
        next(error);
    }
};

// =========================================================
// OBTENER BARBEROS PÚBLICOS POR SLUG
// =========================================================
exports.getBarberosBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        // Buscar barbería
        const barberia = await Barberia.findOne({
            slug: slug.toLowerCase(),
            activa: true
        });

        if (!barberia) {
            return res.status(404).json({
                message: "Barbería no encontrada"
            });
        }

        // Obtener barberos activos
        const barberos = await Barbero.find({
            barberiaId: barberia._id,
            activo: true
        })
            .select('nombre foto descripcion especialidades experiencia')
            .sort({ nombre: 1 });

        res.json(barberos);

    } catch (error) {
        console.error("Error al obtener barberos:", error);
        next(error);
    }
};

// =========================================================
// OBTENER SERVICIOS PÚBLICOS POR SLUG
// =========================================================
exports.getServiciosBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        // Buscar barbería
        const barberia = await Barberia.findOne({
            slug: slug.toLowerCase(),
            activa: true
        });

        if (!barberia) {
            return res.status(404).json({
                message: "Barbería no encontrada"
            });
        }

        // Obtener servicios activos
        const servicios = await Servicio.find({
            barberiaId: barberia._id,
            activo: true
        })
            .select('nombre descripcion duracion precio imagen')
            .sort({ precio: 1 });

        res.json(servicios);

    } catch (error) {
        console.error("Error al obtener servicios:", error);
        next(error);
    }
};

// =========================================================
// OBTENER DISPONIBILIDAD POR SLUG
// =========================================================
exports.getDisponibilidadBySlug = async (req, res, next) => {
    try {
        const { slug, barberoId } = req.params;
        const { fecha, servicioId } = req.query;

        if (!fecha || !servicioId) {
            return res.status(400).json({
                message: "Debe enviar fecha y servicioId"
            });
        }

        // Buscar barbería
        const barberia = await Barberia.findOne({
            slug: slug.toLowerCase(),
            activa: true
        });

        if (!barberia) {
            return res.status(404).json({
                message: "Barbería no encontrada"
            });
        }

        // Verificar que el barbero pertenezca a esta barbería
        const barbero = await Barbero.findOne({
            _id: barberoId,
            barberiaId: barberia._id,
            activo: true
        });

        if (!barbero) {
            return res.status(404).json({
                message: "Barbero no encontrado"
            });
        }

        // Verificar que el servicio pertenezca a esta barbería
        const servicio = await Servicio.findOne({
            _id: servicioId,
            barberiaId: barberia._id,
            activo: true
        });

        if (!servicio) {
            return res.status(404).json({
                message: "Servicio no encontrado"
            });
        }

        // Validar fecha
        const dayjs = require('dayjs');
        const fechaObj = dayjs(fecha);
        if (!fechaObj.isValid()) {
            return res.status(400).json({ message: "Formato de fecha inválido" });
        }

        // Obtener horario del día
        const diaSemana = fechaObj.day();
        const horario = await Horario.findOne({
            barberoId,
            diaSemana,
            activo: true
        });

        if (!horario) {
            return res.json({
                barberoId,
                fecha,
                servicioId,
                turnosDisponibles: []
            });
        }

        const inicioMin = horaToMin(horario.horaInicio);
        const finMin = horaToMin(horario.horaFin);
        const duracionTurno = horario.duracionTurno || 30;

        // Generar turnos base
        const turnos = [];
        let actual = inicioMin;

        while (actual + servicio.duracion <= finMin) {
            turnos.push(minToHora(actual));
            actual += duracionTurno;
        }

        // Obtener reservas del día
        const Reserva = require("../models/Reserva");
        const reservas = await Reserva.find({
            barberoId,
            fecha,
            estado: { $in: ["RESERVADA", "CONFIRMADA"] }
        }).populate("servicioId");

        // Marcar turnos ocupados
        const ocupadas = new Set();

        for (const r of reservas) {
            const inicioReserva = horaToMin(r.hora);
            const duracionReservada = r.servicioId?.duracion || 30;
            const finReserva = inicioReserva + duracionReservada;

            for (const t of turnos) {
                const inicioTurno = horaToMin(t);
                const finTurno = inicioTurno + servicio.duracion;

                if (!(finTurno <= inicioReserva || inicioTurno >= finReserva)) {
                    ocupadas.add(t);
                }
            }
        }

        let disponibles = turnos.filter(t => !ocupadas.has(t));

        // Quitar horas pasadas si es hoy
        if (fechaObj.isSame(dayjs(), "day")) {
            const ahora = dayjs();
            disponibles = disponibles.filter(t => {
                const [h, m] = t.split(":");
                return fechaObj.hour(h).minute(m).isAfter(ahora);
            });
        }

        res.json({
            barberoId,
            fecha,
            servicioId,
            turnosDisponibles: disponibles
        });

    } catch (error) {
        console.error("Error al obtener disponibilidad:", error);
        next(error);
    }
};

// =========================================================
// CREAR RESERVA POR SLUG (PÚBLICO)
// =========================================================
exports.crearReservaBySlug = async (req, res, next) => {
    try {
        const { slug, barberoId } = req.params;
        const { fecha, hora, emailCliente, nombreCliente, servicioId } = req.body;

        console.log("📥 Datos recibidos en crearReservaBySlug:", req.body);

        // ================= VALIDACIONES =================
        if (!fecha || !hora || !emailCliente || !nombreCliente || !servicioId) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            });
        }

        // ================= BARBERÍA =================
        const barberia = await Barberia.findOne({
            slug: slug.toLowerCase(),
            activa: true
        });

        if (!barberia) {
            return res.status(404).json({ message: "Barbería no encontrada" });
        }

        if (barberia.estado === "suspendida") {
            return res.status(403).json({
                message: "Esta barbería no está aceptando reservas"
            });
        }

        // ================= BARBERO =================
        const barbero = await Barbero.findOne({
            _id: barberoId,
            barberiaId: barberia._id,
            activo: true
        });

        if (!barbero) {
            return res.status(404).json({ message: "Barbero no disponible" });
        }

        // ================= SERVICIO =================
        const servicio = await Servicio.findOne({
            _id: servicioId,
            barberiaId: barberia._id,
            activo: true
        });

        if (!servicio) {
            return res.status(404).json({ message: "Servicio no disponible" });
        }

        // ================= CALCULAR horaFin =================
        const horaFin = sumarMinutos(hora, servicio.duracion);

        console.log("⏰ Hora inicio:", hora);
        console.log("⏱️  Duración servicio:", servicio.duracion);
        console.log("⏰ Hora fin calculada:", horaFin);

        // ================= CREAR RESERVA =================
        const crypto = require("crypto");
        const Reserva = require("../models/Reserva");

        const cancelToken = crypto.randomBytes(32).toString("hex");

        const nuevaReserva = await Reserva.create({
            barberiaId: barberia._id,
            barberoId,
            servicioId,
            fecha,
            hora,
            horaFin, // ✅ OBLIGATORIO
            nombreCliente,
            emailCliente,
            estado: "RESERVADA",
            cancelToken
        });

        console.log("✅ Reserva creada:", nuevaReserva._id);

        // ================= EMAIL (NO CRÍTICO) =================
        try {
            const emailService = require("../notifications/emailService");

            // Generar URLs para cancelación y reagendamiento
            const cancelUrl = `${process.env.FRONTEND_URL}/${slug}/cancelar/${nuevaReserva.cancelToken}`;
            const reagendarUrl = `${process.env.FRONTEND_URL}/${slug}/reagendar/${nuevaReserva.cancelToken}`;

            await emailService.reservaConfirmada({
                emailCliente: nuevaReserva.emailCliente,
                nombreCliente: nuevaReserva.nombreCliente,
                fecha: nuevaReserva.fecha,
                hora: nuevaReserva.hora,
                servicio: servicio.nombre,
                cancelUrl,
                reagendarUrl,
                barberiaId: barberia._id // ✅ CRÍTICO para multi-tenant
            });

            console.log("📧 Email de confirmación enviado a:", nuevaReserva.emailCliente);
        } catch (err) {
            // Email falló pero la reserva se creó exitosamente
            // Esto es graceful degradation - el sistema sigue funcionando
            console.warn("⚠️ Email falló pero reserva creada OK:", err.message);
        }

        // ================= RESPUESTA =================
        res.status(201).json({
            message: "Reserva creada correctamente",
            reserva: {
                _id: nuevaReserva._id,
                barberiaId: barberia._id,
                barberoId,
                servicioId,
                fecha,
                hora,
                horaFin,
                nombreCliente,
                emailCliente,
                cancelToken
            }
        });

    } catch (error) {
        // 🛡️ MANEJO DE OVERBOOKING (ERROR ATÓMICO)
        if (error.code === 11000) {
            console.warn("⚠️ Intento de overbooking detectado (Atomic Index Block)");
            return res.status(400).json({
                message: "¡Lo sentimos! Alguien acaba de reservar este horario hace un instante. Por favor, selecciona otro horario o barbero."
            });
        }

        console.error("❌ Error en crearReservaBySlug:", error);
        next(error);
    }
};
