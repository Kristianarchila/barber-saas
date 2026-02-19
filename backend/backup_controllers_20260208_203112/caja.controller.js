const Caja = require("../models/Caja");

/**
 * Controller de Caja
 * Gestiona apertura, cierre y movimientos de caja diaria
 */

// Abrir caja
exports.abrirCaja = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { montoInicial, turno } = req.body;

        // Verificar que no haya una caja abierta
        const cajaAbierta = await Caja.obtenerCajaAbierta(barberiaId);

        if (cajaAbierta) {
            return res.status(400).json({
                message: "Ya existe una caja abierta. Debe cerrarla primero.",
                caja: cajaAbierta
            });
        }

        const caja = await Caja.create({
            barberiaId,
            fecha: new Date().toISOString().slice(0, 10),
            turno: turno || 'COMPLETO',
            responsable: req.user.nombre || req.user.email,
            horaApertura: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
            montoInicial: montoInicial || 50000
        });

        res.status(201).json({
            message: "Caja abierta correctamente",
            caja
        });

    } catch (error) {
        console.error("Error al abrir caja:", error);
        next(error);
    }
};

// Obtener caja actual (abierta)
exports.obtenerCajaActual = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;

        const caja = await Caja.obtenerCajaAbierta(barberiaId);

        if (!caja) {
            return res.status(404).json({
                message: "No hay caja abierta",
                cajaAbierta: false
            });
        }

        res.json({
            cajaAbierta: true,
            caja
        });

    } catch (error) {
        console.error("Error al obtener caja actual:", error);
        next(error);
    }
};

// Agregar ingreso manual a caja
exports.agregarIngreso = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { tipo, monto, concepto } = req.body;

        const caja = await Caja.obtenerCajaAbierta(barberiaId);

        if (!caja) {
            return res.status(404).json({ message: "No hay caja abierta" });
        }

        await caja.agregarIngreso({
            tipo: tipo || 'OTRO',
            monto,
            concepto,
            hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
        });

        res.json({
            message: "Ingreso agregado correctamente",
            caja
        });

    } catch (error) {
        console.error("Error al agregar ingreso:", error);
        next(error);
    }
};

// Agregar egreso a caja
exports.agregarEgreso = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { tipo, monto, concepto, comprobante, autorizadoPor } = req.body;

        const caja = await Caja.obtenerCajaAbierta(barberiaId);

        if (!caja) {
            return res.status(404).json({ message: "No hay caja abierta" });
        }

        await caja.agregarEgreso({
            tipo,
            monto,
            concepto,
            hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
            comprobante,
            autorizadoPor
        });

        res.json({
            message: "Egreso agregado correctamente",
            caja
        });

    } catch (error) {
        console.error("Error al agregar egreso:", error);
        next(error);
    }
};

// Cerrar caja
exports.cerrarCaja = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { montoReal, arqueo, observaciones } = req.body;

        const caja = await Caja.obtenerCajaAbierta(barberiaId);

        if (!caja) {
            return res.status(404).json({ message: "No hay caja abierta" });
        }

        // Actualizar caja con datos de cierre
        caja.horaCierre = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
        caja.montoReal = montoReal;
        caja.arqueo = arqueo;
        caja.observaciones = observaciones;
        caja.estado = 'CERRADA';

        await caja.save();

        // Determinar mensaje según descuadre
        let mensaje = "Caja cerrada correctamente";

        if (caja.nivelDescuadre === 'ALTO') {
            mensaje = `⚠️ Caja cerrada con descuadre ALTO de $${caja.diferencia}. Revisar movimientos.`;
        } else if (caja.nivelDescuadre === 'MENOR') {
            mensaje = `Caja cerrada con descuadre menor de $${caja.diferencia}`;
        }

        res.json({
            message: mensaje,
            caja,
            alerta: caja.nivelDescuadre !== 'NINGUNO' ? {
                nivel: caja.nivelDescuadre,
                diferencia: caja.diferencia
            } : null
        });

    } catch (error) {
        console.error("Error al cerrar caja:", error);
        next(error);
    }
};

// Obtener historial de cajas
exports.obtenerHistorialCajas = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { fechaInicio, fechaFin } = req.query;

        const filtro = { barberiaId, estado: 'CERRADA' };

        if (fechaInicio && fechaFin) {
            filtro.fecha = { $gte: fechaInicio, $lte: fechaFin };
        }

        const cajas = await Caja.find(filtro)
            .sort({ fecha: -1 })
            .limit(30);

        // Calcular estadísticas
        const totalCajas = cajas.length;
        const cajasDescuadradas = cajas.filter(c => c.tieneDescuadre).length;
        const totalDiferencias = cajas.reduce((sum, c) => sum + (c.diferencia || 0), 0);

        res.json({
            cajas,
            estadisticas: {
                totalCajas,
                cajasDescuadradas,
                porcentajeDescuadre: totalCajas > 0 ? Math.round((cajasDescuadradas / totalCajas) * 100) : 0,
                totalDiferencias
            }
        });

    } catch (error) {
        console.error("Error al obtener historial de cajas:", error);
        next(error);
    }
};

module.exports = {
    abrirCaja: exports.abrirCaja,
    obtenerCajaActual: exports.obtenerCajaActual,
    agregarIngreso: exports.agregarIngreso,
    agregarEgreso: exports.agregarEgreso,
    cerrarCaja: exports.cerrarCaja,
    obtenerHistorialCajas: exports.obtenerHistorialCajas
};
