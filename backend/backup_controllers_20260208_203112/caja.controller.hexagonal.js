/**
 * Caja Controller (Hexagonal Architecture Version)
 * Acts as an adapter in the interfaces layer
 */
const container = require('../shared/Container');

// ==========================================
// 1) ABRIR CAJA
// ==========================================
exports.abrirCaja = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { montoInicial, turno } = req.body;
        const responsable = req.user.nombre || req.user.email;

        const useCase = container.abrirCajaUseCase;
        const caja = await useCase.execute(barberiaId.toString(), {
            montoInicial,
            turno,
            responsable
        });

        res.status(201).json({
            message: "Caja abierta correctamente",
            caja: caja.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2) OBTENER CAJA ACTUAL
// ==========================================
exports.obtenerCajaActual = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;

        const useCase = container.obtenerCajaActualUseCase;
        const caja = await useCase.execute(barberiaId.toString());

        if (!caja) {
            return res.status(404).json({
                message: "No hay caja abierta",
                cajaAbierta: false
            });
        }

        res.json({
            cajaAbierta: true,
            caja: caja.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3) AGREGAR INGRESO
// ==========================================
exports.agregarIngreso = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { tipo, monto, concepto } = req.body;

        const useCase = container.registrarMovimientoCajaUseCase;
        const caja = await useCase.execute(barberiaId.toString(), {
            tipoMovimiento: 'INGRESO',
            monto,
            concepto,
            tipo
        });

        res.json({
            message: "Ingreso agregado correctamente",
            caja: caja.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4) AGREGAR EGRESO
// ==========================================
exports.agregarEgreso = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { tipo, monto, concepto, comprobante, autorizadoPor } = req.body;

        const useCase = container.registrarMovimientoCajaUseCase;
        const caja = await useCase.execute(barberiaId.toString(), {
            tipoMovimiento: 'EGRESO',
            monto,
            concepto,
            tipo,
            comprobante,
            autorizadoPor
        });

        res.json({
            message: "Egreso agregado correctamente",
            caja: caja.toObject()
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5) CERRAR CAJA
// ==========================================
exports.cerrarCaja = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { montoReal, arqueo, observaciones } = req.body;

        const useCase = container.cerrarCajaUseCase;
        const caja = await useCase.execute(barberiaId.toString(), {
            montoReal,
            arqueo,
            observaciones
        });

        // Determine message based on discrepancy
        let mensaje = "Caja cerrada correctamente";
        const cajaObj = caja.toObject();

        if (cajaObj.nivelDescuadre === 'ALTO') {
            mensaje = `⚠️ Caja cerrada con descuadre ALTO de $${cajaObj.diferencia}. Revisar movimientos.`;
        } else if (cajaObj.nivelDescuadre === 'MENOR') {
            mensaje = `Caja cerrada con descuadre menor de $${cajaObj.diferencia}`;
        }

        res.json({
            message: mensaje,
            caja: cajaObj,
            alerta: cajaObj.nivelDescuadre !== 'NINGUNO' ? {
                nivel: cajaObj.nivelDescuadre,
                diferencia: cajaObj.diferencia
            } : null
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 6) HISTORIAL DE CAJAS
// ==========================================
exports.obtenerHistorialCajas = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const useCase = container.listHistorialCajasUseCase;
        const result = await useCase.execute(barberiaId.toString(), req.query);

        res.json({
            cajas: result.cajas.map(c => c.toObject()),
            estadisticas: result.estadisticas
        });
    } catch (error) {
        next(error);
    }
};
