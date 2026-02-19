const Cupon = require("../infrastructure/database/mongodb/models/Cupon");
const UsoCupon = require("../infrastructure/database/mongodb/models/UsoCupon");

/**
 * @desc    Validar un cupón
 * @param   {String} codigo - Código del cupón
 * @param   {ObjectId} barberiaId - ID de la barbería
 * @param   {ObjectId} userId - ID del usuario
 * @param   {Number} montoCompra - Monto de la compra
 * @param   {String} tipoCompra - "servicio" o "producto"
 * @param   {Array} items - Items de la compra (para validar específicos)
 * @returns {Object} { valid, cupon, descuento, mensaje }
 */
const validarCupon = async (codigo, barberiaId, userId, montoCompra, tipoCompra = "todos", items = []) => {
    try {
        // Buscar cupón
        const cupon = await Cupon.findOne({
            codigo: codigo.toUpperCase(),
            barberia: barberiaId,
        });

        if (!cupon) {
            return { valid: false, mensaje: "Cupón no encontrado" };
        }

        // Verificar si está activo
        if (!cupon.activo) {
            return { valid: false, mensaje: "Cupón desactivado" };
        }

        // Verificar fechas
        const now = new Date();
        if (cupon.fechaInicio > now) {
            return { valid: false, mensaje: "Cupón aún no está vigente" };
        }
        if (cupon.fechaExpiracion < now) {
            return { valid: false, mensaje: "Cupón expirado" };
        }

        // Verificar límite de usos total
        if (cupon.usoMaximo !== null && cupon.usosActuales >= cupon.usoMaximo) {
            return { valid: false, mensaje: "Cupón agotado" };
        }

        // Verificar límite de usos por usuario
        const usosUsuario = await UsoCupon.countDocuments({
            cupon: cupon._id,
            usuario: userId,
        });

        if (usosUsuario >= cupon.usosPorUsuario) {
            return { valid: false, mensaje: "Ya has usado este cupón el máximo de veces permitidas" };
        }

        // Verificar monto mínimo
        if (montoCompra < cupon.montoMinimo) {
            return {
                valid: false,
                mensaje: `Monto mínimo de compra: $${cupon.montoMinimo}`,
            };
        }

        // Verificar aplicabilidad (servicios vs productos)
        if (cupon.aplicableA !== "todos" && cupon.aplicableA !== tipoCompra) {
            return {
                valid: false,
                mensaje: `Cupón solo aplicable a ${cupon.aplicableA}`,
            };
        }

        // Verificar servicios/productos específicos
        if (cupon.serviciosEspecificos.length > 0 || cupon.productosEspecificos.length > 0) {
            const itemIds = items.map((item) => item.id || item._id || item);
            const specificIds = cupon.serviciosEspecificos.length > 0
                ? cupon.serviciosEspecificos
                : cupon.productosEspecificos;

            const tieneItem = itemIds.some((id) =>
                specificIds.some((specId) => specId.toString() === id.toString())
            );

            if (!tieneItem) {
                return {
                    valid: false,
                    mensaje: "Cupón no aplicable a los items seleccionados",
                };
            }
        }

        // Calcular descuento
        let descuento;
        if (cupon.tipo === "porcentaje") {
            descuento = (montoCompra * cupon.valor) / 100;
        } else {
            descuento = cupon.valor;
        }

        // Asegurar que el descuento no sea mayor al monto
        descuento = Math.min(descuento, montoCompra);

        return {
            valid: true,
            cupon,
            descuento,
            montoFinal: montoCompra - descuento,
            mensaje: "Cupón válido",
        };
    } catch (error) {
        console.error("Error validando cupón:", error);
        return { valid: false, mensaje: "Error validando cupón" };
    }
};

/**
 * @desc    Aplicar un cupón (registrar uso)
 */
const aplicarCupon = async (cupon, userId, barberiaId, montoOriginal, descuento, reservaId = null, pedidoId = null) => {
    try {
        // Registrar uso
        await UsoCupon.create({
            cupon: cupon._id,
            barberia: barberiaId,
            usuario: userId,
            reserva: reservaId,
            pedido: pedidoId,
            montoOriginal,
            descuentoAplicado: descuento,
            montoFinal: montoOriginal - descuento,
        });

        // Incrementar contador de usos
        cupon.usosActuales++;
        await cupon.save();

        return { success: true };
    } catch (error) {
        console.error("Error aplicando cupón:", error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    validarCupon,
    aplicarCupon,
};
